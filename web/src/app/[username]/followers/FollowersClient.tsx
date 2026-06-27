"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import UnfollowModal from "@/components/modals/UnfollowModal";

const UserAvatar = "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/assets/user-avatar.png";

interface Follower {
    id: number;
    fullName: string | null;
    username: string | null;
    profileImg: string | null;
}

interface FollowersClientProps {
    followers: Follower[];
    currentUserFollowingIds: number[];
    profileUser: {
        fullName: string | null;
        username: string | null;
        profileImg: string | null;
    };
    currentUserId: number | null;
}

export default function FollowersClient({ followers, currentUserFollowingIds, profileUser, currentUserId }: FollowersClientProps) {
    const router = useRouter();
    const [followingSet, setFollowingSet] = useState<Set<number>>(new Set(currentUserFollowingIds));
    const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
    const [userToUnfollow, setUserToUnfollow] = useState<Follower | null>(null);

    const handleFollow = async (follower: Follower, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (loadingIds.has(follower.id)) return;

        if (followingSet.has(follower.id)) {
            setUserToUnfollow(follower);
            return;
        }

        setLoadingIds(prev => new Set(prev).add(follower.id));

        setFollowingSet(prev => {
            const next = new Set(prev);
            next.add(follower.id);
            return next;
        });

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/follow`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ followingId: follower.id })
            });
            const data = await res.json();
            if (!data.success) {
                setFollowingSet(prev => {
                    const next = new Set(prev);
                    next.delete(follower.id);
                    return next;
                });
                if (data.status === 401) {
                    window.location.href = "/auth";
                } else {
                    toast.error("Došlo je do greške.");
                }
            }
        } catch (error) {
            setFollowingSet(prev => {
                const next = new Set(prev);
                next.delete(follower.id);
                return next;
            });
        } finally {
            setLoadingIds(prev => {
                const next = new Set(prev);
                next.delete(follower.id);
                return next;
            });
        }
    };

    const handleConfirmUnfollow = async () => {
        if (!userToUnfollow) return;

        const userId = userToUnfollow.id;
        setLoadingIds(prev => new Set(prev).add(userId));
        setUserToUnfollow(null);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/follow`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ followingId: userId })
            });
            const data = await res.json();
            if (data.success && !data.isFollowing) {
                setFollowingSet(prev => {
                    const next = new Set(prev);
                    next.delete(userId);
                    return next;
                });
            } else if (!data.success) {
                toast.error("Došlo je do greške.");
            }
        } catch (error) {
            toast.error("Došlo je do greške.");
        } finally {
            setLoadingIds(prev => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
        }
    };

    return (
        <div className="w-full min-h-[calc(100vh-50px)] bg-bg-1 pt-2 pb-6">
            <div className="max-w-3xl mx-auto px-4 md:px-0">
                {/* Header */}
                <h1 className="text-text-main text-xl sm:text-2xl font-bold mt-4 mb-8 text-center">Pratioci</h1>

                {/* Profile Header */}
                <Link href={`/${profileUser.username}`} className="flex items-center gap-4 mb-8 transition-colors cursor-pointer w-max group">
                    <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 relative bg-gray-700">
                        <Image
                            src={profileUser.profileImg?.split("|||")[0] || UserAvatar}
                            alt={profileUser.fullName || "User"}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-lg">{profileUser.fullName || profileUser.username}</span>
                        <span className="text-gray-400 text-base">@{profileUser.username}</span>
                    </div>
                </Link>

                {/* List */}
                <div className="flex flex-col gap-3">
                    {followers.length === 0 ? (
                        <p className="text-gray-400 text-center py-10 bg-bg-2/30 rounded-2xl">Ovaj korisnik još uvek nema pratioca.</p>
                    ) : (
                        followers.map((follower, index) => (
                            <motion.div
                                key={follower.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => router.push(`/${follower.username}`)}
                                className="flex items-center justify-between p-4 bg-bg-2 border border-bg-3 rounded-3xl transition-all group hover:border-[#555] hover:brightness-110 cursor-pointer"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-700 overflow-hidden relative shrink-0 border border-bg-3">
                                        <Image
                                            src={follower.profileImg?.split("|||")[0] || UserAvatar}
                                            alt={follower.fullName || "User"}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-white font-bold text-base md:text-lg truncate">{follower.fullName || follower.username}</span>
                                        <span className="text-gray-400 text-xs md:text-sm">@{follower.username}</span>
                                    </div>
                                </div>
                                {currentUserId !== follower.id && (
                                    <button
                                        onClick={(e) => handleFollow(follower, e)}
                                        disabled={loadingIds.has(follower.id)}
                                        className={`shrink-0 px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer disabled:opacity-60 ${followingSet.has(follower.id)
                                            ? "bg-bg-3 text-text-main hover:bg-bg-4"
                                            : "bg-[#5b42f3] hover:bg-[#4b35d6] text-white"
                                            }`}
                                    >
                                        {followingSet.has(follower.id) ? "Pratite" : "Prati"}
                                    </button>
                                )}
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            <UnfollowModal
                isOpen={!!userToUnfollow}
                onClose={() => setUserToUnfollow(null)}
                onConfirm={handleConfirmUnfollow}
                username={userToUnfollow?.username || ""}
            />
        </div>
    );
}
