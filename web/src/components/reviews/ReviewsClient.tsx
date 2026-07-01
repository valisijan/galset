"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import StarRating from "./StarRating";
const UserAvatar = "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/assets/user-avatar.png?updatedAt=1776365714850";
import InfiniteScroll from "../InfiniteScroll";
import { Star, MoreVertical } from "lucide-react";
import ReviewModal from "./ReviewModal";
import ReportReviewModal from "../modals/ReportReviewModal";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Reviewer {
    id: number;
    fullName: string;
    username: string;
    profileImg: string | null;
}

interface Review {
    id: number;
    rating: number;
    comment: string | null;
    createdAt: string;
    reviewer: Reviewer;
}

interface ReviewsClientProps {
    targetUserId: number;
    initialReviews: Review[];
    currentUserId?: number | null;
}

const formatReviewDate = (dateString: string): string => {
    const reviewDate = new Date(dateString);
    const now = new Date();

    const reviewDay = new Date(reviewDate.getFullYear(), reviewDate.getMonth(), reviewDate.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const diffMs = today.getTime() - reviewDay.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Danas";
    if (diffDays === 1) return "Juče";

    const currentYear = now.getFullYear();
    const reviewYear = reviewDate.getFullYear();

    const monthNames = [
        "januar", "februar", "mart", "april", "maj", "jun",
        "jul", "avgust", "septembar", "oktobar", "novembar", "decembar"
    ];

    const day = reviewDate.getDate();
    const month = monthNames[reviewDate.getMonth()];

    if (reviewYear === currentYear) {
        return `${day}. ${month}`;
    } else {
        return `${day}. ${month} ${reviewYear}.`;
    }
};

const formatReviewRelativeDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 60) {
        return "Pre nekoliko sekundi";
    }

    if (diffMinutes < 60) {
        const lastDigit = diffMinutes % 10;
        const lastTwoDigits = diffMinutes % 100;
        if (lastDigit === 1 && lastTwoDigits !== 11) {
            return `Pre ${diffMinutes} minut`;
        } else if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
            return `Pre ${diffMinutes} minuta`;
        } else {
            return `Pre ${diffMinutes} minuta`;
        }
    }

    if (diffHours < 24) {
        const lastDigit = diffHours % 10;
        const lastTwoDigits = diffHours % 100;
        if (lastDigit === 1 && lastTwoDigits !== 11) {
            return `Pre ${diffHours} sat`;
        } else if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
            return `Pre ${diffHours} sata`;
        } else {
            return `Pre ${diffHours} sati`;
        }
    }

    if (diffDays < 30) {
        const lastDigit = diffDays % 10;
        const lastTwoDigits = diffDays % 100;
        if (lastDigit === 1 && lastTwoDigits !== 11) {
            return `Pre ${diffDays} dan`;
        } else {
            return `Pre ${diffDays} dana`;
        }
    }

    if (diffMonths < 12) {
        const lastDigit = diffMonths % 10;
        const lastTwoDigits = diffMonths % 100;
        if (lastDigit === 1 && lastTwoDigits !== 11) {
            return `Pre ${diffMonths} mesec`;
        } else if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
            return `Pre ${diffMonths} meseca`;
        } else {
            return `Pre ${diffMonths} meseci`;
        }
    }

    const lastDigit = diffYears % 10;
    const lastTwoDigits = diffYears % 100;
    if (lastDigit === 1 && lastTwoDigits !== 11) {
        return `Pre ${diffYears} godine`;
    } else if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
        return `Pre ${diffYears} godine`;
    } else {
        return `Pre ${diffYears} godina`;
    }
};

export default function ReviewsClient({ targetUserId, initialReviews, currentUserId }: ReviewsClientProps) {
    const [reviews, setReviews] = useState<Review[]>(initialReviews);
    const isOwnProfile = currentUserId === targetUserId;
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(initialReviews.length === 10);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
    const [reportingReviewId, setReportingReviewId] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest">("newest");

    const isFirstMount = useRef(true);

    useEffect(() => {
        const handleOutsideClick = () => {
            setActiveMenuId(null);
        };
        window.addEventListener("click", handleOutsideClick);
        return () => window.removeEventListener("click", handleOutsideClick);
    }, []);

    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }

        const fetchReviews = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews?userId=${targetUserId}&page=${page}&limit=10&sortBy=${sortBy}`);
                if (!res.ok) throw new Error("Failed to fetch reviews");
                const data = await res.json();
                if (data.success) {
                    if (page === 1) {
                        setReviews(data.reviews);
                    } else {
                        setReviews(prev => [...prev, ...data.reviews]);
                    }
                    setHasMore(data.reviews.length === 10);
                }
            } catch (err) {
                console.error("Error fetching reviews:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [page, sortBy, targetUserId]);

    const handleSortChange = (newSort: "newest" | "highest" | "lowest") => {
        if (newSort === sortBy) return;
        setSortBy(newSort);
        setPage(1);
    };

    return (
        <div className="flex flex-col gap-4">
            {reviews.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-16 h-16 bg-bg-2 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-bold">Nema ocena</h3>
                    <p className="text-gray-400 text-sm mt-1">
                        Korisnik trenutno nema nijednu ocenu.
                    </p>
                    <button
                        onClick={() => {
                            if (isOwnProfile) {
                                toast.error("Ne možete oceniti sami sebe.");
                                return;
                            }
                            setIsReviewModalOpen(true);
                        }}
                        className="mt-6 inline-block bg-bg-2 hover:bg-bg-3 px-6 py-2.5 rounded-full text-sm font-semibold transition-colors cursor-pointer"
                    >
                        Ocenite korisnika
                    </button>
                </div>
            ) : (
                <>
                    {/* SORTING BUTTONS */}
                    <div className="flex flex-col gap-2 mb-4">
                        <span className="text-white text-sm font-semibold">Sortiraj ocene</span>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={() => handleSortChange("newest")}
                                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${sortBy === "newest"
                                        ? "bg-[#5b42f3] text-white border-[#5b42f3]"
                                        : "bg-bg-2 hover:bg-bg-3 text-text-main border-bg-3"
                                    }`}
                            >
                                Najnovije
                            </button>
                            <button
                                onClick={() => handleSortChange("highest")}
                                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${sortBy === "highest"
                                        ? "bg-[#5b42f3] text-white border-[#5b42f3]"
                                        : "bg-bg-2 hover:bg-bg-3 text-text-main border-bg-3"
                                    }`}
                            >
                                Najviša
                            </button>
                            <button
                                onClick={() => handleSortChange("lowest")}
                                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${sortBy === "lowest"
                                        ? "bg-[#5b42f3] text-white border-[#5b42f3]"
                                        : "bg-bg-2 hover:bg-bg-3 text-text-main border-bg-3"
                                    }`}
                            >
                                Najniža
                            </button>
                        </div>
                    </div>

                    {reviews.map((review, index) => (
                        <div key={review.id} className="p-6 flex flex-col gap-4 bg-bg-2 border border-bg-3 rounded-3xl transition-all hover:bg-bg-3/50 group/card">
                            {/* USER INFO */}
                            <div className="flex items-center justify-between">
                                <Link href={`/${review.reviewer.username}`} className="flex items-center gap-3 w-fit hover:opacity-80 transition group">
                                    <div className="rounded-full overflow-hidden w-14 h-14 relative bg-bg-3 border border-bg-3 shrink-0">
                                        <Image
                                            src={review.reviewer.profileImg?.split("|||")[0] || UserAvatar}
                                            alt={review.reviewer.fullName}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-base md:text-lg group-hover:text-[#6366f1] transition-colors leading-tight">{review.reviewer.fullName}</span>
                                        <span className="text-gray-400 text-sm leading-tight">{review.reviewer.username}</span>
                                    </div>
                                </Link>
                                <div className="relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveMenuId(active => active === review.id ? null : review.id);
                                        }}
                                        className="p-2 hover:bg-bg-3 rounded-full transition-colors cursor-pointer text-gray-400 hover:text-white"
                                    >
                                        <MoreVertical className="w-5 h-5" />
                                    </button>

                                    <AnimatePresence>
                                        {activeMenuId === review.id && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                                transition={{ duration: 0.1 }}
                                                className="absolute right-0 mt-2 bg-bg-2 border border-bg-3 rounded-[20px] shadow-lg p-1 z-50 min-w-[130px] text-left"
                                            >
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setReportingReviewId(review.id);
                                                        setActiveMenuId(null);
                                                    }}
                                                    className="w-full text-left px-3 py-2 text-xs md:text-sm text-red-500 hover:bg-bg-3 hover:text-red-400 font-bold rounded-2xl transition-colors cursor-pointer"
                                                >
                                                    Prijavi ocenu
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* RATING & CONTENT */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <StarRating rating={review.rating} size={18} />
                                    <span className="text-gray-500 text-xs md:text-sm leading-tight">
                                        {formatReviewRelativeDate(review.createdAt)}
                                    </span>
                                </div>

                                {review.comment && (
                                    <p className="text-text-main opacity-80 leading-relaxed text-sm md:text-base">
                                        {review.comment}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}

                    <InfiniteScroll
                        loadMore={() => setPage(prev => prev + 1)}
                        hasMore={hasMore}
                        isLoading={loading}
                    />
                </>
            )}

            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                targetUserId={targetUserId}
            />

            <ReportReviewModal
                isOpen={reportingReviewId !== null}
                onClose={() => setReportingReviewId(null)}
                reviewId={reportingReviewId || 0}
            />
        </div>
    );
}
