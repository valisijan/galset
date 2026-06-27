"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Tag, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import InfiniteScroll from "../InfiniteScroll";
import Avatar from "../Avatar";
import Image from "next/image";
import Link from "next/link";
import UnfollowModal from "../modals/UnfollowModal";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface Notification {
    id: number;
    userId: number;
    type: string;
    title: string;
    body: string;
    isRead: boolean;
    readAt: string | null;
    imageUrl: string | null;
    actionUrl: string | null;
    senderId: number | null;
    adId: number | null;
    reviewId: number | null;
    messageId: number | null;
    createdAt: string;
    expiresAt: string;
}

export default function NotificationsClient({ initialNotifications }: { initialNotifications: any[] }) {
    const { sessionToken } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(initialNotifications.length === 20);

    // Follow state per senderId
    const [followingMap, setFollowingMap] = useState<Record<number, boolean>>({});
    const [unfollowTarget, setUnfollowTarget] = useState<{ senderId: number; username: string } | null>(null);
    const [followLoading, setFollowLoading] = useState<Record<number, boolean>>({});

    const router = useRouter();

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffMins < 1) return "Sada";
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays === 1) return "Juče";
        if (diffDays < 7) return `${diffDays}d`;
        return date.toLocaleDateString("sr-RS", { day: "numeric", month: "short" });
    };

    // Mark all as read on mount + dispatch event to refresh counts
    useEffect(() => {
        const markAsRead = async () => {
            if (!sessionToken) return;
            try {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${sessionToken}` }
                });
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                window.dispatchEvent(new Event("notificationsUpdate"));
            } catch (err) {
                console.error(err);
            }
        };
        markAsRead();
    }, [sessionToken]);

    // Listen to new socket notifications and prepend them to the list in real-time
    useEffect(() => {
        const handleNewNotification = (e: Event) => {
            const customEvent = e as CustomEvent<Notification>;
            if (customEvent.detail) {
                if (customEvent.detail.type === "MESSAGE_REACTION") return;
                const newNotif = { ...customEvent.detail, isRead: true };
                setNotifications(prev => {
                    if (prev.find(n => n.id === newNotif.id)) return prev;
                    return [newNotif, ...prev];
                });
                
                // Call backend to mark it as read immediately since they are on the page
                if (sessionToken) {
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
                        method: "POST",
                        headers: { "Authorization": `Bearer ${sessionToken}` }
                    }).catch(err => console.error(err));
                }
            }
        };

        window.addEventListener("newNotification", handleNewNotification as EventListener);
        return () => window.removeEventListener("newNotification", handleNewNotification as EventListener);
    }, [sessionToken]);

    // Fetch follow status for USER_FOLLOW notifications
    useEffect(() => {
        if (!sessionToken) return;
        const followNotifs = notifications.filter(n => n.type === "USER_FOLLOW" && n.senderId);
        if (!followNotifs.length) return;

        const senderIds = [...new Set(followNotifs.map(n => n.senderId as number))];
        // Check follow status for each sender
        senderIds.forEach(async (senderId) => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${senderId}/is-following`, {
                    headers: { "Authorization": `Bearer ${sessionToken}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setFollowingMap(prev => ({ ...prev, [senderId]: data.isFollowing }));
                }
            } catch { }
        });
    }, [notifications, sessionToken]);

    const handleFollow = async (senderId: number, username: string) => {
        if (!sessionToken) return;
        if (followingMap[senderId]) {
            // Already following → open unfollow modal
            setUnfollowTarget({ senderId, username });
            return;
        }
        setFollowLoading(prev => ({ ...prev, [senderId]: true }));
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/follow`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionToken}`
                },
                body: JSON.stringify({ followingId: senderId }),
            });
            const data = await res.json();
            if (data.success) {
                setFollowingMap(prev => ({ ...prev, [senderId]: data.isFollowing }));
                window.dispatchEvent(new Event("followingUpdate"));
            }
        } catch { }
        setFollowLoading(prev => ({ ...prev, [senderId]: false }));
    };

    const handleUnfollow = async () => {
        if (!unfollowTarget || !sessionToken) return;
        const { senderId } = unfollowTarget;
        setFollowLoading(prev => ({ ...prev, [senderId]: true }));
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/follow`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionToken}`
                },
                body: JSON.stringify({ followingId: senderId }),
            });
            const data = await res.json();
            if (data.success) {
                setFollowingMap(prev => ({ ...prev, [senderId]: false }));
                window.dispatchEvent(new Event("followingUpdate"));
            }
        } catch { }
        setFollowLoading(prev => ({ ...prev, [senderId]: false }));
        setUnfollowTarget(null);
    };

    useEffect(() => {
        if (page === 1 || !sessionToken) return;
        const fetchMore = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications?page=${page}&limit=20`, {
                    headers: { "Authorization": `Bearer ${sessionToken}` }
                });
                if (!res.ok) throw new Error("Failed");
                const data = await res.json();
                if (data.success) {
                    setNotifications(prev => [...prev, ...data.notifications]);
                    setHasMore(data.notifications.length === 20);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMore();
    }, [page, sessionToken]);

    const renderLeft = (notif: Notification) => {
        if (notif.type === "USER_FOLLOW") {
            const usernameMatch = notif.body.match(/(?:@|Korisnik\s+)(\S+)/);
            const username = usernameMatch ? usernameMatch[1] : "Korisnik";
            return (
                <Avatar imageUrl={notif.imageUrl} name={username} size={48} />
            );
        }

        if (notif.type === "NEW_REVIEW") {
            const usernameMatch = notif.body.match(/Korisnik\s+(\S+)\s+vas/);
            const username = usernameMatch ? usernameMatch[1] : "Korisnik";
            return (
                <Link
                    href={`/${username}`}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 cursor-pointer"
                >
                    <Avatar imageUrl={notif.imageUrl} name={username} size={48} />
                </Link>
            );
        }

        const NoImage = "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/assets/no-image.png";
        const getOptimizedUrl = (url: string) => {
            if (!url || typeof url !== 'string') return url;
            if (url.includes('ik.imagekit.io')) {
                const separator = url.includes('?') ? '&' : '?';
                return `${url}${separator}tr=f-auto,w-200`;
            }
            return url;
        };

        const adImgSrc = notif.imageUrl ? getOptimizedUrl(notif.imageUrl.split("|||")[0]) : NoImage;
        return (
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-bg-3 relative bg-bg-3">
                <Image src={adImgSrc} alt="" width={56} height={56} className="w-full h-full object-cover" />
            </div>
        );
    };

    const renderRight = (notif: Notification) => {
        if (notif.type !== "USER_FOLLOW" || !notif.senderId) return null;
        const senderId = notif.senderId;
        const isFollowing = followingMap[senderId];
        const isLoading = followLoading[senderId];
        // Extract username from body or actionUrl
        const usernameMatch = notif.body.match(/(?:@|Korisnik\s+)(\S+)/);
        const username = usernameMatch ? usernameMatch[1] : "korisnik";

        return (
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleFollow(senderId, username); }}
                disabled={isLoading}
                className={`ml-2 flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${isFollowing
                    ? "bg-bg-3 text-gray-400 hover:bg-bg-4"
                    : "bg-[#5b42f3] text-white hover:bg-[#4b35d6]"
                    } ${isLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
            >
                {isFollowing ? "Pratite" : "Prati"}
            </button>
        );
    };

    return (
        <div className="w-full text-text-main">
            <h1 className="text-text-main text-xl sm:text-2xl font-bold mt-4 mb-6 text-center">Obaveštenja</h1>

            <div className="flex flex-col gap-2">
                <AnimatePresence initial={false}>
                    {notifications.map((notif, index) => {
                        const card = (
                            <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ delay: index < 10 ? index * 0.04 : 0 }}
                                className={`flex items-center gap-3 p-3 md:p-4 bg-bg-2 border rounded-3xl hover:border-gray-600 transition-all group cursor-pointer ${!notif.isRead
                                    ? "border-l-4 border-l-[#6366f1] border-bg-3"
                                    : "border-bg-3"
                                    }`}
                            >
                                {renderLeft(notif)}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="font-bold text-sm md:text-base text-text-main leading-snug break-words">
                                            {notif.body}
                                        </h3>
                                        <span className="text-[10px] md:text-xs text-gray-500 shrink-0 self-start mt-0.5">
                                            {formatTime(notif.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                {renderRight(notif)}
                            </motion.div>
                        );

                        if (notif.actionUrl) {
                            if (notif.type === "NEW_REVIEW") {
                                return (
                                    <div
                                        key={notif.id}
                                        onClick={() => router.push(notif.actionUrl!)}
                                        className="block"
                                    >
                                        {card}
                                    </div>
                                );
                            }
                            return (
                                <Link key={notif.id} href={notif.actionUrl} className="block">
                                    {card}
                                </Link>
                            );
                        }
                        return <div key={notif.id}>{card}</div>;
                    })}
                </AnimatePresence>

                {notifications.length === 0 && !loading && (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-bg-2 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-bold">Nema obaveštenja</h3>
                        <p className="text-gray-400 text-sm mt-1">
                            Bićete obavešteni kada se nešto desi.
                        </p>
                    </div>
                )}

                <InfiniteScroll
                    loadMore={() => setPage(prev => prev + 1)}
                    hasMore={hasMore}
                    isLoading={loading}
                />
            </div>

            {/* Unfollow Modal */}
            <UnfollowModal
                isOpen={!!unfollowTarget}
                onClose={() => setUnfollowTarget(null)}
                onConfirm={handleUnfollow}
                username={unfollowTarget?.username}
            />
        </div>
    );
}
