"use client";

import { useState, useEffect } from "react";
import ReviewModal from "./ReviewModal";
import UserMoreModal from "@/components/modals/UserMoreModal";
import { EllipsisVertical } from "lucide-react";
import { toast } from "sonner";

interface ReviewAndMoreProps {
    targetUser: any;
    currentUserId: number | null;
}

export default function ReviewAndMoreButtons({ targetUser, currentUserId }: ReviewAndMoreProps) {
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [blockStatus, setBlockStatus] = useState<{ isBlockedByMe: boolean; amIBlocked: boolean } | null>(null);

    const isOwnProfile = currentUserId === targetUser.id;

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("action") === "review") {
            setIsReviewOpen(true);
        }
    }, []);

    useEffect(() => {
        const fetchBlockStatus = async () => {
            if (!currentUserId || !targetUser?.id || isOwnProfile) return;
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/block/status?userId=${targetUser.id}`);
                const data = await res.json();
                if (data.success) {
                    setBlockStatus({
                        isBlockedByMe: data.isBlockedByMe,
                        amIBlocked: data.amIBlocked,
                    });
                }
            } catch (e) { }
        };
        fetchBlockStatus();
    }, [currentUserId, targetUser?.id, isOwnProfile]);

    const handleReviewClick = () => {
        if (isOwnProfile) {
            toast.error("Ne možete oceniti sami sebe.");
            return;
        }
        if (!currentUserId) {
            window.dispatchEvent(new Event("open-auth-modal"));
            return;
        }
        setIsReviewOpen(true);
    };

    const handleShare = async () => {
        const shareData = {
            title: `Ocene korisnika ${targetUser?.fullName}`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                toast.success("Link kopiran u clipboard!");
            }
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                toast.success("Link kopiran u clipboard!");
            }
        }
    };

    const handleBlockConfirm = async () => {
        if (!currentUserId) {
            window.location.href = "/auth";
            return;
        }
        setLoading(true);
        try {
            const isUnblocking = blockStatus?.isBlockedByMe;

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/block`, {
                method: isUnblocking ? "DELETE" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ blockedId: targetUser.id })
            });

            const data = await res.json();
            if (data.success) {
                setBlockStatus(prev => ({
                    ...prev!,
                    isBlockedByMe: !isUnblocking
                }));
                toast.success(isUnblocking ? `Korisnik ${targetUser.username} je odblokiran.` : `Korisnik ${targetUser.username} je blokiran.`);
            } else {
                toast.error(data.error || "Greška pri obradi zahteva.");
            }
        } catch (err) {
            toast.error("Došlo je do greške.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex items-center gap-3 w-full">
                <button
                    onClick={handleReviewClick}
                    className="flex-1 md:flex-none justify-center bg-[#5b42f3] hover:bg-[#4b35d6] text-white font-medium px-6 md:px-20 py-2.5 rounded-full transition-colors min-w-[120px] cursor-pointer"
                >
                    Oceni
                </button>

                <button
                    onClick={() => setIsMoreOpen(true)}
                    className="p-2.5 bg-bg-2 rounded-full px-3 py-3 hover:bg-bg-3 transition-colors text-text-main cursor-pointer shrink-0"
                >
                    <EllipsisVertical size={20} />
                </button>
            </div>

            <ReviewModal
                isOpen={isReviewOpen}
                onClose={() => setIsReviewOpen(false)}
                targetUserId={targetUser.id}
            />

            <UserMoreModal
                isOpen={isMoreOpen}
                onClose={() => setIsMoreOpen(false)}
                user={targetUser}
                isBlocked={!!blockStatus?.isBlockedByMe}
                isOwnProfile={isOwnProfile}
                onShare={handleShare}
                onBlockConfirm={handleBlockConfirm}
                blockLoading={loading}
                onReview={() => setIsReviewOpen(true)}
            />
        </>
    );
}
