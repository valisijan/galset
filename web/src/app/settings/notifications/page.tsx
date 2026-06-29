"use client";

import { useState, useEffect } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useAuth } from "@/context/AuthContext";

export default function NotificationsPage() {
    const { user, sessionToken } = useAuth();
    const { permission } = usePushNotifications(user?.id ? Number(user.id) : undefined);

    const statusText = permission === "granted" ? "Uključeno" : "Isključeno";

    const [preferences, setPreferences] = useState({
        messages: true,
        expiredAds: true,
        expiredPromotions: true,
        followedAds: true,
        newFollowers: true,
        newReviews: true,
    });
    const [loadingPrefs, setLoadingPrefs] = useState(true);

    useEffect(() => {
        if (!sessionToken) return;

        async function fetchPrefs() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account/notification-preferences`, {
                    headers: {
                        "Authorization": `Bearer ${sessionToken}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.preferences) {
                        setPreferences({
                            messages: data.preferences.messages,
                            expiredAds: data.preferences.expiredAds,
                            expiredPromotions: data.preferences.expiredPromotions,
                            followedAds: data.preferences.followedAds,
                            newFollowers: data.preferences.newFollowers,
                            newReviews: data.preferences.newReviews,
                        });
                    }
                }
            } catch (err) {
                console.error("Error fetching preferences:", err);
            } finally {
                setLoadingPrefs(false);
            }
        }

        fetchPrefs();
    }, [sessionToken]);

    const togglePreference = async (key: keyof typeof preferences) => {
        if (!sessionToken) return;

        const newValue = !preferences[key];

        // Optimistic update
        setPreferences(prev => ({
            ...prev,
            [key]: newValue,
        }));

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account/notification-preferences`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionToken}`
                },
                body: JSON.stringify({
                    [key]: newValue
                })
            });

            if (!res.ok) {
                // Revert on error
                setPreferences(prev => ({
                    ...prev,
                    [key]: !newValue,
                }));
            }
        } catch (err) {
            console.error("Error toggling preference:", err);
            // Revert on error
            setPreferences(prev => ({
                ...prev,
                [key]: !newValue,
            }));
        }
    };

    return (
        <div className="flex flex-col gap-10 pb-20">
            <h1 className="text-text-main text-xl sm:text-2xl font-bold mt-4 text-center">Obaveštenja</h1>

            {/* Push Notifications Section */}
            <div className="flex flex-col gap-3">
                <h2 className="text-text-main font-bold text-base mb-1 mt-2">Push obaveštenja</h2>

                <div className="flex items-center justify-between w-full px-5 py-4 rounded-full bg-bg-2 border border-bg-3">
                    <span className="text-text-main font-medium text-sm">Push obaveštenja</span>
                    <span className="text-gray-400 text-sm font-semibold pr-2">{statusText}</span>
                </div>
                <p className="text-gray-400 text-xs px-5 mt-1 leading-relaxed">
                    Push obaveštenja možete uključivati i isključivati direktno u vašem browseru.
                </p>
            </div>

            {/* Preferences Section */}
            <div className="flex flex-col gap-3">
                <h2 className="text-text-main font-bold text-base mb-1 mt-2">Obaveštavaj me o</h2>

                {/* Poruke */}
                <div className="flex items-center justify-between w-full px-5 py-4 rounded-full bg-bg-2 border border-bg-3">
                    <span className="text-text-main font-medium text-sm">Poruke</span>
                    <button
                        type="button"
                        disabled={loadingPrefs}
                        onClick={() => togglePreference("messages")}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${preferences.messages ? "bg-[#5b42f3]" : "bg-bg-3"
                            } ${loadingPrefs ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        <span
                            className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${preferences.messages ? "left-6" : "left-1"
                                }`}
                        />
                    </button>
                </div>

                {/* Istekli oglasi */}
                <div className="flex items-center justify-between w-full px-5 py-4 rounded-full bg-bg-2 border border-bg-3">
                    <span className="text-text-main font-medium text-sm">Istekli oglasi</span>
                    <button
                        type="button"
                        disabled={loadingPrefs}
                        onClick={() => togglePreference("expiredAds")}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${preferences.expiredAds ? "bg-[#5b42f3]" : "bg-bg-3"
                            } ${loadingPrefs ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        <span
                            className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${preferences.expiredAds ? "left-6" : "left-1"
                                }`}
                        />
                    </button>
                </div>

                {/* Istekle promocije */}
                <div className="flex items-center justify-between w-full px-5 py-4 rounded-full bg-bg-2 border border-bg-3">
                    <span className="text-text-main font-medium text-sm">Istekle promocije</span>
                    <button
                        type="button"
                        disabled={loadingPrefs}
                        onClick={() => togglePreference("expiredPromotions")}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${preferences.expiredPromotions ? "bg-[#5b42f3]" : "bg-bg-3"
                            } ${loadingPrefs ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        <span
                            className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${preferences.expiredPromotions ? "left-6" : "left-1"
                                }`}
                        />
                    </button>
                </div>

                {/* Praceni oglasi */}
                <div className="flex items-center justify-between w-full px-5 py-4 rounded-full bg-bg-2 border border-bg-3">
                    <span className="text-text-main font-medium text-sm">Praćeni oglasi</span>
                    <button
                        type="button"
                        disabled={loadingPrefs}
                        onClick={() => togglePreference("followedAds")}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${preferences.followedAds ? "bg-[#5b42f3]" : "bg-bg-3"
                            } ${loadingPrefs ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        <span
                            className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${preferences.followedAds ? "left-6" : "left-1"
                                }`}
                        />
                    </button>
                </div>

                {/* Novi pratioci */}
                <div className="flex items-center justify-between w-full px-5 py-4 rounded-full bg-bg-2 border border-bg-3">
                    <span className="text-text-main font-medium text-sm">Novi pratioci</span>
                    <button
                        type="button"
                        disabled={loadingPrefs}
                        onClick={() => togglePreference("newFollowers")}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${preferences.newFollowers ? "bg-[#5b42f3]" : "bg-bg-3"
                            } ${loadingPrefs ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        <span
                            className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${preferences.newFollowers ? "left-6" : "left-1"
                                }`}
                        />
                    </button>
                </div>

                {/* Nove ocene */}
                <div className="flex items-center justify-between w-full px-5 py-4 rounded-full bg-bg-2 border border-bg-3">
                    <span className="text-text-main font-medium text-sm">Nove ocene</span>
                    <button
                        type="button"
                        disabled={loadingPrefs}
                        onClick={() => togglePreference("newReviews")}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${preferences.newReviews ? "bg-[#5b42f3]" : "bg-bg-3"
                            } ${loadingPrefs ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        <span
                            className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${preferences.newReviews ? "left-6" : "left-1"
                                }`}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}
