"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import AdsList from "@/components/ads/AdsList"
import { Star, UserPen, EllipsisVertical, X, Ban, Flag, Share2, Info, Calendar, MapPin } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
const UserAvatar = "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/assets/user-avatar.png?updatedAt=1776365714850";
import UserMoreModal from "./modals/UserMoreModal";
import UnfollowModal from "./modals/UnfollowModal";
import ProfileImageModal from "@/app/[username]/ProfileImageModal";

interface User {
    id: number
    fullName: string
    username: string
    email: string
    profileImg: string | null
    createdAt: Date
    country?: string | null
    description?: string | null
}

interface UserPageClientProps {
    user: User;
    isFollowingInitial?: boolean;
    isOwnProfile?: boolean;
    reviewsStats: { count: number; avg: number };
    initialFollowersCount: number;
    initialAdsCount: number;
    initialAds?: any[];
    initialWishlistIds?: number[];
    initialTotal?: number;
}

export default function UserPageClient({
    user,
    isFollowingInitial = false,
    isOwnProfile = false,
    reviewsStats,
    initialFollowersCount,
    initialAdsCount,
    initialAds = [],
    initialWishlistIds = [],
    initialTotal = 0
}: UserPageClientProps) {
    const joinedDate = new Date(user.createdAt);
    const monthNames = ["januar", "februar", "mart", "april", "maj", "jun", "jul", "avgust", "septembar", "oktobar", "novembar", "decembar"];
    const formattedJoinedDate = `${monthNames[joinedDate.getMonth()]} ${joinedDate.getFullYear()}`;

    const [isFollowing, setIsFollowing] = useState(isFollowingInitial);
    const [followersCount, setFollowersCount] = useState(initialFollowersCount);
    const [adsCount] = useState(initialAdsCount);
    const [loadingFollow, setLoadingFollow] = useState(false);
    const [showUnfollowModal, setShowUnfollowModal] = useState(false);
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [blockLoading, setBlockLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user: currentUser } = useAuth();

    useEffect(() => {
        if (searchParams && searchParams.get("options") === "true") {
            setShowOptionsModal(true);
        }
    }, [searchParams]);

    // Fetch current block status on mount
    useEffect(() => {
        if (isOwnProfile) return;
        const fetchBlockStatus = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/block/status?userId=${user.id}`);
                const data = await res.json();
                if (data.success) {
                    setIsBlocked(data.isBlockedByMe);
                }
            } catch (e) {
                // ignore
            }
        };
        fetchBlockStatus();
    }, [user.id, isOwnProfile]);

    useEffect(() => {
        if (showUnfollowModal) {
            window.history.pushState({ modalOpen: true }, "", window.location.href);
            const handlePopState = () => setShowUnfollowModal(false);
            window.addEventListener("popstate", handlePopState);
            return () => {
                window.removeEventListener("popstate", handlePopState);
                if (window.history.state?.modalOpen) {
                }
            };
        }
    }, [showUnfollowModal]);

    const handleCloseModal = () => {
        if (showUnfollowModal) {
            router.back();
        }
    };

    const handleShare = async () => {
        if (typeof window === "undefined") return

        const shareData = {
            title: user.fullName,
            text: `Pogledaj profil korisnika ${user.fullName}`,
            url: window.location.href
        }

        try {
            if (navigator.share) {
                await navigator.share(shareData)
            } else {
                await navigator.clipboard.writeText(window.location.href)
                toast.success("Link kopiran na clipboard!")
            }
        } catch (err) {
            console.error("Error sharing:", err)
        }
    }

    const handleFollowClick = async () => {
        if (!currentUser) {
            window.dispatchEvent(new Event("open-auth-modal"));
            return;
        }
        if (isFollowing) {
            setShowUnfollowModal(true);
        } else {
            await performFollowAction();
        }
    };

    const performFollowAction = async () => {
        const originalStatus = isFollowing;
        setIsFollowing(!originalStatus); // Optimistic Update

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/follow`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ followingId: user.id })
            });
            const data = await res.json();
            if (data.success) {
                setIsFollowing(data.isFollowing);
                setFollowersCount(prev => data.isFollowing ? prev + 1 : Math.max(0, prev - 1));
                window.dispatchEvent(new Event("followingUpdate"));
            } else {
                setIsFollowing(originalStatus); // Revert on failure
                if (data.status === 401) {
                    window.location.href = "/auth";
                }
            }
        } catch (error) {
            console.error(error);
            setIsFollowing(originalStatus); // Revert on error
        }
    };

    const handleUnfollowConfirm = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/follow`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ followingId: user.id })
            });
            const data = await res.json();
            if (data.success && !data.isFollowing) {
                setIsFollowing(false);
                setFollowersCount(prev => Math.max(0, prev - 1));
                window.dispatchEvent(new Event("followingUpdate"));
                handleCloseModal();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleBlockConfirm = async () => {
        setBlockLoading(true);
        try {
            if (isBlocked) {
                // Unblock
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/block`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ blockedId: user.id })
                });
                const data = await res.json();
                if (data.success) {
                    setIsBlocked(false);
                    toast.success(`Korisnik ${user.username} je odblokirano`);
                } else {
                    toast.error("Greška pri odblokiranji");
                }
            } else {
                // Block
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/block`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ blockedId: user.id })
                });
                const data = await res.json();
                if (data.success) {
                    setIsBlocked(true);
                    toast.success(`Korisnik ${user.username} je blokiran`);
                } else if (res.status === 401) {
                    window.location.href = "/auth";
                } else {
                    toast.error("Greška pri blokiranju");
                }
            }
        } catch (e) {
            toast.error("Greška, pokušajte ponovo");
        } finally {
            setBlockLoading(false);
        }
    };

    const selectClass = "w-full bg-bg-2 border border-bg-3 text-text-main rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6366f1] transition-colors cursor-pointer appearance-none";
    const labelClass = "block text-sm font-medium text-gray-400 mb-2";

    return (
        <div className="min-h-screen bg-bg-1 text-text-main">
            <div className="w-full px-4 max-w-4xl mx-auto py-5 md:py-7">

                {/* HEADER */}
                <div className="bg-bg-1 rounded-3xl p-0 md:p-6 mb-6 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">

                    {/* Left: Profile Info */}
                    <div className="flex flex-col items-start gap-4 md:gap-6 w-full md:w-auto text-left">
                        <div className="flex flex-row items-center gap-4 md:gap-6">
                            <div
                                className="w-20 h-20 md:w-28 md:h-28 bg-gray-700 rounded-full overflow-hidden relative shrink-0 cursor-pointer"
                                onClick={() => setShowImageModal(true)}
                            >
                                <Image
                                    src={user.profileImg?.split("|||")[0] || UserAvatar}
                                    alt={user.fullName}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="flex flex-col items-start pt-1.5">
                                <h1 className="text-[22px] md:text-3xl font-bold mb-0.5">{user.fullName}</h1>
                                <p className="text-gray-400 text-sm md:text-base mb-2.5">@{user.username}</p>

                                <div className="flex items-center gap-8 md:gap-4 mb-3 mt-2 md:mt-0">
                                    <button
                                        onClick={() => {
                                            const adsEl = document.getElementById("user-ads-section");
                                            if (adsEl) {
                                                const y = adsEl.getBoundingClientRect().top + window.scrollY - 80;
                                                window.scrollTo({ top: y, behavior: 'smooth' });
                                            }
                                        }}
                                        className="flex flex-col md:flex-row items-center md:gap-1 text-[13px] md:text-[14px] cursor-pointer hover:opacity-80 transition-opacity"
                                    >
                                        <strong className="text-text-main font-bold text-base md:text-[14px] leading-tight md:leading-normal">{adsCount}</strong>
                                        <span className="text-black/70 dark:text-white/70 font-medium leading-tight md:leading-normal">oglasa</span>
                                    </button>

                                    <Link
                                        href={`/${user.username}/reviews`}
                                        className="flex flex-col md:flex-row items-center md:gap-1 text-[13px] md:text-[14px] hover:opacity-80 transition-opacity"
                                    >
                                        <strong className="text-text-main font-bold text-base md:text-[14px] leading-tight md:leading-normal whitespace-nowrap">
                                            {reviewsStats.avg.toFixed(1)} ({reviewsStats.count})
                                        </strong>
                                        <span className="text-black/70 dark:text-white/70 font-medium leading-tight md:leading-normal">ocena</span>
                                    </Link>

                                    <Link
                                        href={`/${user.username}/followers`}
                                        className="flex flex-col md:flex-row items-center md:gap-1 text-[13px] md:text-[14px] hover:opacity-80 transition-opacity"
                                    >
                                        <strong className="text-text-main font-bold text-base md:text-[14px] leading-tight md:leading-normal">{followersCount}</strong>
                                        <span className="text-black/70 dark:text-white/70 font-medium leading-tight md:leading-normal">pratioca</span>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {user.description && (
                            <p className="text-gray-300 text-sm md:text-[15px] leading-relaxed max-w-xl">
                                {user.description}
                            </p>
                        )}
                    </div>

                    {/* Right: Buttons */}
                    <div className="w-full md:w-auto flex flex-row md:flex-row gap-3 mt-2 md:mt-12 justify-center">
                        {isOwnProfile ? (
                            <div className="flex-1 md:flex-none flex items-center gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => router.push("/settings/profile")}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 md:px-10 md:py-2.5 rounded-full font-medium transition-colors cursor-pointer bg-[#5b42f3] hover:bg-[#4b35d6] text-white border border-transparent"
                                >
                                    <UserPen size={18} />
                                    <span className="hidden md:inline">Uredi profil</span>
                                    <span className="md:hidden">Uredi profil</span>
                                </button>

                                <button
                                    onClick={() => setShowOptionsModal(true)}
                                    className="flex-none flex items-center justify-center px-4 py-4 md:px-4 md:py-3.5 bg-bg-2 hover:bg-bg-3 text-text-main rounded-full font-medium transition-colors cursor-pointer"
                                >
                                    <EllipsisVertical size={20} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={handleFollowClick}
                                    className={`flex-[3] md:flex-none flex items-center justify-center gap-2 px-4 py-3 md:px-19.5 md:py-2 rounded-full font-medium transition-colors cursor-pointer ${isFollowing
                                        ? "bg-bg-3 text-text-main hover:bg-bg-4"
                                        : "bg-[#5b42f3] hover:bg-[#4b35d6] text-white border border-transparent"
                                        }`}
                                >
                                    {isFollowing ? (
                                        <span>Pratite</span>
                                    ) : (
                                        <span>Prati</span>
                                    )}
                                </button>

                                {/* Ellipsis options button */}
                                <button
                                    onClick={() => setShowOptionsModal(true)}
                                    className="flex-none flex items-center justify-center px-4 py-4 md:px-4 md:py-3.5 bg-bg-2 hover:bg-bg-3 text-text-main rounded-full font-medium transition-colors cursor-pointer"
                                >
                                    <EllipsisVertical size={20} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* CONTENT GRID */}
                <div className="flex flex-col md:flex-row gap-6">

                    {/* Right: Ads List */}
                    <div id="user-ads-section" className="flex-1 w-full mt-4 md:mt-0">
                        <AdsList
                            section="marketplace"
                            userId={user.id}
                            initialAds={initialAds}
                            initialWishlistIds={initialWishlistIds}
                            initialTotal={initialTotal}
                        />
                    </div>

                </div>
            </div>

            {/* Unfollow Modal */}
            <UnfollowModal
                isOpen={showUnfollowModal}
                onClose={handleCloseModal}
                onConfirm={handleUnfollowConfirm}
                username={user.fullName}
            />

            <UserMoreModal
                isOpen={showOptionsModal}
                onClose={() => setShowOptionsModal(false)}
                user={user}
                isBlocked={isBlocked}
                onShare={handleShare}
                onBlockConfirm={handleBlockConfirm}
                blockLoading={blockLoading}
                isOwnProfile={isOwnProfile}
            />

            {/* Profile Image Modal */}
            <ProfileImageModal
                isOpen={showImageModal}
                onClose={() => setShowImageModal(false)}
                imageUrl={user.profileImg?.split("|||")[0] || UserAvatar}
                altText={user.fullName}
            />
        </div>
    )
}
