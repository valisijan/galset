"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

type Counts = {
    myAds: number;
    wishlist: number;
    following: number;
    reviews: number;
    unread: number;
    notifications: number;
};

type CountsContextType = {
    counts: Counts;
    refreshCounts: () => Promise<void>;
};

const CountsContext = createContext<CountsContextType | undefined>(undefined);

const CACHE_KEY = "user_menu_counts";

export const CountsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, sessionToken } = useAuth();
    const [counts, setCounts] = useState<Counts>({
        myAds: 0,
        wishlist: 0,
        following: 0,
        reviews: 0,
        unread: 0,
        notifications: 0,
    });

    useEffect(() => {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            try {
                setCounts(JSON.parse(cached));
            } catch (e) {
                console.error("Failed to parse cached counts", e);
            }
        }
    }, []);

    const safeJson = async (res: Response) => {
        if (!res.ok) return {};
        try {
            return await res.json();
        } catch {
            return {};
        }
    };

    const refreshCounts = useCallback(async () => {
        if (!user || !sessionToken) return;

        const headers = {
            "Authorization": `Bearer ${sessionToken}`
        };

        try {
            const [adsRes, wishlistRes, followingRes, reviewsRes, unreadRes, notifRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads?userId=` + user.id, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/follow`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/stats?userId=` + user.id, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/unread`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/unread-count`, { headers }),
            ]);

            const [adsData, wishlistData, followingData, reviewsData, unreadData, notifData] = await Promise.all([
                safeJson(adsRes),
                safeJson(wishlistRes),
                safeJson(followingRes),
                safeJson(reviewsRes),
                safeJson(unreadRes),
                safeJson(notifRes),
            ]);

            const newCounts = {
                myAds: adsData.success ? adsData.total || 0 : 0,
                wishlist: wishlistData.success ? wishlistData.total || 0 : 0,
                following: followingData.success ? followingData.total || 0 : 0,
                reviews: reviewsData.success ? reviewsData.stats?.count || 0 : 0,
                unread: unreadData.success ? unreadData.count : 0,
                notifications: notifData.success ? notifData.count : 0,
            };

            setCounts(newCounts);
            localStorage.setItem(CACHE_KEY, JSON.stringify(newCounts));
        } catch (error) {
            console.error("Failed to fetch counts in context:", error);
        }
    }, [user, sessionToken]);

    useEffect(() => {
        if (user) {
            refreshCounts();
        } else {
            const reset = { myAds: 0, wishlist: 0, following: 0, reviews: 0, unread: 0, notifications: 0 };
            setCounts(reset);
            localStorage.removeItem(CACHE_KEY);
        }
    }, [user, refreshCounts]);

    useEffect(() => {
        window.addEventListener("wishlistUpdate", refreshCounts);
        window.addEventListener("followingUpdate", refreshCounts);
        window.addEventListener("unreadUpdate", refreshCounts);
        window.addEventListener("notificationsUpdate", refreshCounts);

        return () => {
            window.removeEventListener("wishlistUpdate", refreshCounts);
            window.removeEventListener("followingUpdate", refreshCounts);
            window.removeEventListener("unreadUpdate", refreshCounts);
            window.removeEventListener("notificationsUpdate", refreshCounts);
        };
    }, [refreshCounts]);

    return (
        <CountsContext.Provider value={{ counts, refreshCounts }}>
            {children}
        </CountsContext.Provider>
    );
};

export const useCounts = () => {
    const context = useContext(CountsContext);
    if (context === undefined) {
        throw new Error("useCounts must be used within a CountsProvider");
    }
    return context;
};
