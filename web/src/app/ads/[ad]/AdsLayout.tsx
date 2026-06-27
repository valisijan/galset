"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
const NoImage = "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/assets/no-image.png";
const UserAvatar = "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/assets/user-avatar.png";
import { useRouter } from "next/navigation"
import { MapPin, Phone, MessageCircle, Heart, Clock, ChevronLeft, ChevronRight, SquarePen, Share2, Plus, Minus, Megaphone } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import dynamic from "next/dynamic";
import ReportAdModal from "@/components/modals/ReportAdModal";
import GalleryModal, { SwipeableGallery } from "./GalleryModal";
import { cityCoords } from "@/lib/cityCoords";
import AdsGrid from "@/components/ads/AdsGrid";

const getOptimizedUrl = (url: string) => {
    if (!url || typeof url !== 'string') return url;
    if (url.includes('ik.imagekit.io') || url.includes('imagekit')) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}tr=f-auto`;
    }
    return url;
};

const AdMap = dynamic(() => import("@/components/map/AdMap"), {
    ssr: false,
});

const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 60) return `pre ${diffMin} min`;
    if (diffHours < 24) {
        if (diffHours === 1) return `pre 1 sat`;
        if (diffHours < 5) return `pre ${diffHours} sata`;
        return `pre ${diffHours} sati`;
    }
    if (diffDays <= 30) return `pre ${diffDays} dana`;

    const day = date.getDate();
    const months = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "avg", "sep", "okt", "nov", "dec"];
    return `${day}. ${months[date.getMonth()]}`;
};

const formatDateTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate();
    const months = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "avg", "sep", "okt", "nov", "dec"];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} ${hours}:${minutes}`;
};

const RecommendedAds = ({ currentAdId, wishlistIds, onWishlistToggle, currentUser }: { currentAdId: number, wishlistIds: number[], onWishlistToggle: (e: React.MouseEvent, adId: number) => void, currentUser: any }) => {
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { sessionToken } = useAuth();

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const headers: Record<string, string> = {};
                if (sessionToken) {
                    headers["Authorization"] = `Bearer ${sessionToken}`;
                }
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads?limit=15&status=ACTIVE`, { headers });
                const data = await res.json();
                if (data.success) {
                    const filtered = data.ads.filter((a: any) => a.id !== currentAdId);
                    const shuffled = filtered.sort(() => 0.5 - Math.random());
                    setAds(shuffled.slice(0, 8));
                }
            } catch (err) {
                console.error("Failed to fetch recommended ads:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAds();
    }, [currentAdId]);

    if (!loading && ads.length === 0) return null;

    return (
        <div className="mt-12 w-full overflow-hidden">
            <h3 className="text-xl font-bold mb-6">Preporučeni oglasi</h3>
            <AdsGrid
                ads={ads}
                loading={loading}
                wishlistIds={wishlistIds}
                onWishlistToggle={(adId) => onWishlistToggle({ preventDefault: () => { }, stopPropagation: () => { } } as any, adId)}
                currentUser={currentUser}
                columns={4}
            />
        </div>
    );
};


interface AdsLayoutProps {
    ad: any;
    adSlug?: string;
    loading?: boolean;
    filters?: any[];
    categories?: any[];
}



const CallButton = ({ phone }: { phone: string }) => {
    const [showNumber, setShowNumber] = useState(false);

    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    }, []);

    if (isMobile) {
        return (
            <a
                href={`tel:${phone}`}
                className="w-full bg-[#5b42f3] text-white font-bold py-3 rounded-full hover:bg-[#4b35d6] transition-colors flex items-center justify-center gap-2 cursor-pointer decoration-none"
            >
                <Phone className="w-5 h-5" />
                Pozovi
            </a>
        );
    }

    return (
        <button
            onClick={() => setShowNumber(true)}
            className="w-full bg-[#5b42f3] text-white font-bold py-3 rounded-full hover:bg-[#4b35d6] transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
            <Phone className="w-5 h-5" />
            {showNumber ? phone : "Pozovi"}
        </button>
    );
};

const StickyCallButton = ({ phone }: { phone: string }) => {
    const [showNumber, setShowNumber] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    }, []);

    if (isMobile) {
        return (
            <a
                href={`tel:${phone}`}
                className="bg-[#5b42f3] text-white font-bold py-3 px-6 rounded-full hover:bg-[#4b35d6] transition-colors flex items-center justify-center gap-2 shadow-lg shrink-0 decoration-none"
            >
                <Phone className="w-5 h-5" />
                <span className="text-sm font-bold">Pozovi</span>
            </a>
        );
    }

    return (
        <button
            onClick={() => setShowNumber(prev => !prev)}
            className="bg-[#5b42f3] text-white font-bold py-3 px-6 rounded-full hover:bg-[#4b35d6] transition-colors flex items-center justify-center gap-2 shadow-lg shrink-0"
        >
            <Phone className="w-5 h-5" />
            <span className="text-sm font-bold">{showNumber ? phone : "Pozovi"}</span>
        </button>
    );
};
const linkifyUrls = (html: string) => {
    if (!html) return "";    // Match: existing <a> tags OR full URLs (https://..., www.) OR bare domain.tld
    // Uses \b word boundary instead of lookbehind for TS compatibility
    const regex = /(<a\s+[^>]*>.*?<\/a>|<[^>]+>)|((?:https?:\/\/|www\.)[^\s<>"']+|\b([a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.(?:com|net|org|hr|rs|ba|me|si|io|co|app|dev|tv|info|biz|eu|uk|de|fr|it|es|nl|pl|pt|cz|sk|at|ch|be|dk|fi|se|no|hu|ro|bg|gr|tr|ae|us|ca|au|nz|jp|cn|br|in|id|mx|za|ng|eg|sa|il|pk|ph|sg|my|th|vn|kr|hk|tw|ar|cl|pe|ve)(?:[^\s<>"']*)?\b))/gi;


    return html.replace(regex, (match, tag, url) => {
        if (tag) {
            // Already an <a> tag — just ensure it opens in a new tab and has the right color
            if (tag.toLowerCase().startsWith('<a')) {
                let updatedTag = tag;
                if (!/target=/i.test(updatedTag)) {
                    updatedTag = updatedTag.replace(/^<a/i, '<a target="_blank" rel="noopener noreferrer"');
                }
                if (!/class=/i.test(updatedTag)) {
                    updatedTag = updatedTag.replace(/^<a/i, '<a class="text-[#6366f1] hover:underline"');
                } else {
                    updatedTag = updatedTag.replace(/class=["']([^"']*)["']/i, 'class="$1 text-[#6366f1] hover:underline"');
                }
                return updatedTag;
            }
            return tag; // Other HTML tags — pass through untouched
        }
        if (url) {
            let href = url;
            if (!/^https?:\/\//i.test(href)) {
                href = 'https://' + href;
            }
            return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-[#6366f1] hover:underline font-semibold">${url}</a>`;
        }
        return match;
    });
};
const isJobsCategory = (categorySlug: string, categories: any[]): boolean => {
    if (!categorySlug || !categories.length) return false;
    const checkDescendant = (cats: any[], currentPath: string[]): boolean => {
        for (const cat of cats) {
            const slug = cat.slug || cat.subslug || cat.childslug;
            const newPath = [...currentPath, slug];
            if (slug === categorySlug) {
                return newPath.includes("jobs");
            }
            if (cat.subcategories) {
                if (checkDescendant(cat.subcategories, newPath)) return true;
            }
        }
        return false;
    };
    return checkDescendant(categories, []);
};

export default function AdsLayout({ ad, adSlug, loading = false, filters = [], categories = [] }: AdsLayoutProps) {
    const router = useRouter()
    const { user, sessionToken } = useAuth()
    const [categoryName, setCategoryName] = useState<string>("");
    const [categoryPath, setCategoryPath] = useState<{ name: string; slug: string }[]>([]);

    useEffect(() => {
        if (!ad?.category || !categories.length) return;

        const findCategoryPath = (cats: any[], path: { name: string; slug: string }[]): { name: string; slug: string }[] | null => {
            for (const cat of cats) {
                const slug = cat.slug || cat.subslug || cat.childslug || "";
                const newPath = [...path, { name: cat.name, slug }];
                if (String(cat.id) === String(ad.category) || cat.slug === ad.category || cat.subslug === ad.category || cat.childslug === ad.category) {
                    return newPath;
                }
                if (cat.subcategories) {
                    const found = findCategoryPath(cat.subcategories, newPath);
                    if (found) return found;
                }
            }
            return null;
        };

        const path = findCategoryPath(categories, []);
        if (path) {
            setCategoryPath(path);
            setCategoryName(path[path.length - 1]?.name || "");
        }
    }, [ad?.category, categories]);
    const [showGallery, setShowGallery] = useState(false)
    const [[page, direction], setPage] = useState([0, 0])
    const [wishlistIds, setWishlistIds] = useState<number[]>([])
    const isWishlisted = wishlistIds.includes(ad?.id)
    const [mounted, setMounted] = useState(false)
    const isOwner = mounted && user?.id && ad?.userId && String(user.id) === String(ad.userId);
    const isDeactivated = mounted && ad?.status && String(ad.status).toUpperCase() === "DEACTIVATED";
    const mobileButtonsRef = useRef<HTMLDivElement>(null);
    const [showSticky, setShowSticky] = useState(false);
    const [blockStatus, setBlockStatus] = useState<{ isBlockedByMe: boolean; amIBlocked: boolean } | null>(null);
    const isContactBlocked = !!(blockStatus?.isBlockedByMe || blockStatus?.amIBlocked);
    const [showReportModal, setShowReportModal] = useState(false);

    const [showAllDetails, setShowAllDetails] = useState(false);
    const [showFullDesc, setShowFullDesc] = useState(false);
    const [isDescLong, setIsDescLong] = useState(false);
    const [descHeight, setDescHeight] = useState<number>(0);
    const descRef = useRef<HTMLDivElement>(null);

    const [detailsHeight, setDetailsHeight] = useState<number>(0);
    const gridRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        if (gridRef.current) {
            setDetailsHeight(gridRef.current.scrollHeight);
        }
    }, [ad?.attributes, loading]);

    useEffect(() => {
        if (descRef.current) {
            const scrollH = descRef.current.scrollHeight;
            if (scrollH > 400) {
                setIsDescLong(true);
                setDescHeight(scrollH);
            }
        }
    }, [ad?.description, loading]);

    useEffect(() => {
        if (!mounted || loading) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setShowSticky(!entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        if (mobileButtonsRef.current) {
            observer.observe(mobileButtonsRef.current);
        }

        return () => observer.disconnect();
    }, [mounted, loading]);

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const checkWishlist = async () => {
            if (!user || !ad?.id) return
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist`)
                const data = await res.json()
                if (data.success) {
                    setWishlistIds(data.ads.map((a: any) => a.id))
                }
            } catch (err) {
                console.error("Failed to check wishlist:", err)
            }
        }
        checkWishlist()
    }, [user, ad?.id])

    const [totalAds, setTotalAds] = useState(0)
    const [reviewStats, setReviewStats] = useState({ avg: 0, count: 0 })

    useEffect(() => {
        const fetchReviewStats = async () => {
            if (!ad?.userId) return
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/stats?userId=${ad.userId}`)
                const data = await res.json()
                if (data.success) {
                    setReviewStats(data.stats)
                }
            } catch (err) {
                console.error("Failed to fetch review stats:", err)
            }
        }
        fetchReviewStats()
    }, [ad?.userId])

    useEffect(() => {
        const fetchUserAdsCount = async () => {
            if (!ad?.userId) return
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads?userId=${ad.userId}&limit=1`)
                const data = await res.json()
                if (data.success) {
                    setTotalAds(data.total || 0)
                }
            } catch (err) {
                console.error("Failed to fetch user ads count:", err)
            }
        }
        fetchUserAdsCount()
    }, [ad?.userId])

    useEffect(() => {
        const recordView = async () => {
            if (!ad?.id) return
            
            // For guest/anonymous users, save to localStorage history
            if (!user?.id) {
                try {
                    const localHistoryStr = localStorage.getItem("galset_local_history");
                    let localHistory = localHistoryStr ? JSON.parse(localHistoryStr) : [];
                    if (!Array.isArray(localHistory)) localHistory = [];
                    localHistory = localHistory.filter((h: any) => h.adId !== ad.id);
                    localHistory.unshift({ adId: ad.id, category: ad.category });
                    localStorage.setItem("galset_local_history", JSON.stringify(localHistory.slice(0, 40)));
                } catch (err) {
                    console.error("Failed to record local view:", err);
                }
            }

            // Record view in database (for viewcount, and also for user history if logged in)
            try {
                const headers: Record<string, string> = { "Content-Type": "application/json" };
                if (sessionToken) {
                    headers["Authorization"] = `Bearer ${sessionToken}`;
                }
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/history`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({ adId: ad.id, userId: user?.id || null }),
                })
            } catch (err) {
                console.error("Failed to record view:", err)
            }
        }
        recordView()
    }, [user?.id, ad?.id, ad?.category, sessionToken])

    useEffect(() => {
        const fetchBlockStatus = async () => {
            if (!user?.id || !ad?.userId || isOwner) return;
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/block/status?userId=${ad.userId}`);
                const data = await res.json();
                if (data.success) {
                    setBlockStatus({
                        isBlockedByMe: data.isBlockedByMe,
                        amIBlocked: data.amIBlocked,
                    });
                }
            } catch (e) {
                // ignore
            }
        };
        fetchBlockStatus();
    }, [user?.id, ad?.userId, isOwner]);

    const handleWishlistToggle = async (e: React.MouseEvent, adId: number) => {
        e.preventDefault()
        e.stopPropagation()

        if (!user) {
            window.dispatchEvent(new Event("open-auth-modal"))
            return
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adId }),
            })
            const data = await res.json()
            if (data.success) {
                if (data.action === "added") {
                    setWishlistIds(prev => [...prev, adId])
                } else {
                    setWishlistIds(prev => prev.filter(id => id !== adId))
                }
                window.dispatchEvent(new Event("wishlistUpdate"))
            }
        } catch (err) {
            toast.error("Greška pri ažuriranju liste želja")
        }
    }

    if (!ad && !loading) return null;

    const images = (ad && ad.images && ad.images.length > 0) ? ad.images.map((img: string) => getOptimizedUrl(img)) : [getOptimizedUrl(NoImage)];
    const hasImages = true;

    const imageIndex = ((page % images.length) + images.length) % images.length



    const openGallery = (index: number) => {
        setPage([index, 0])
        setShowGallery(true)
    }

    const closeGallery = () => {
        setShowGallery(false)
    }

    const nextImage = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation()
        setPage(prev => [prev[0] + 1, 1])
    }, [])

    const prevImage = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation()
        setPage(prev => [prev[0] - 1, -1])
    }, [])



    useEffect(() => {
        const container = document.getElementById('desktop-thumbnail-container');
        const activeThumb = document.getElementById(`thumb-${imageIndex}`);
        if (container && activeThumb) {
            const containerLeft = container.scrollLeft;
            const containerWidth = container.clientWidth;
            const containerRight = containerLeft + containerWidth;

            const thumbLeft = activeThumb.offsetLeft;
            const thumbWidth = activeThumb.offsetWidth;
            const thumbRight = thumbLeft + thumbWidth;

            // Only scroll if the thumbnail is near or outside the view boundaries
            // Use a margin to ensure it's comfortably visible
            const margin = 40;

            if (thumbLeft < containerLeft + margin) {
                container.scrollTo({
                    left: Math.max(0, thumbLeft - margin),
                    behavior: 'smooth'
                });
            } else if (thumbRight > containerRight - margin) {
                container.scrollTo({
                    left: Math.min(container.scrollWidth - containerWidth, thumbRight - containerWidth + margin),
                    behavior: 'smooth'
                });
            }
        }
    }, [imageIndex]);



    const handleShare = async () => {
        if (typeof window === "undefined") return

        const shareData = {
            title: ad.title,
            text: `Pogledaj ovaj oglas: ${ad.title} - ${ad.price ? ad.price + ' ' + ad.currency : 'Po dogovoru'}`,
            url: window.location.href
        }

        try {
            if (navigator.share) {
                await navigator.share(shareData)
            } else {
                await navigator.clipboard.writeText(window.location.href)
                toast.success("Link kopiran u clipboard!")
            }
        } catch (err) {
            console.error("Error sharing:", err)
            // If share was cancelled by user, don't show error
            if (err instanceof Error && err.name === 'AbortError') return;

            try {
                await navigator.clipboard.writeText(window.location.href)
                toast.success("Link kopiran u clipboard!")
            } catch (clipErr) {
                toast.error("Greška pri deljenju")
            }
        }
    }

    const handleContactSeller = async () => {
        if (!user) {
            window.dispatchEvent(new Event("open-auth-modal"));
            return;
        }
        if (user.id === ad?.userId) {
            toast.info("Ne možete poslati poruku samom sebi");
            return;
        }

        try {
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (sessionToken) {
                headers["Authorization"] = `Bearer ${sessionToken}`;
            }
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/init`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    receiverId: ad.userId,
                    adId: ad.id
                })
            });
            const data = await res.json();
            if (data.success && data.conversationId) {
                router.push(`/inbox/${data.conversationId}`);
            } else {
                toast.error(data.error || "Greška pri pokretanju chata");
            }
        } catch (err) {
            console.error("Failed to init chat:", err);
            toast.error("Došlo je do greške");
        }
    };

    const AdHeaderInfo = () => (
        <div className="bg-bg-2 rounded-3xl p-6 md:p-8 border border-bg-3">
            <div className="flex justify-between items-start gap-4 mb-4">
                <h1 className="text-2xl md:text-2xl font-bold leading-tight line-clamp-3 flex-1">{ad?.title}</h1>
                {!isOwner && (
                    <button
                        onClick={(e) => handleWishlistToggle(e, ad.id)}
                        className="p-1 text-text-main cursor-pointer group shrink-0"
                        title="Dodaj u listu želja"
                    >
                        <Heart
                            size={24}
                            className={`transition-all duration-200 ${isWishlisted ? "text-red-500 fill-red-500 scale-110" : "opacity-75 group-hover:opacity-100"}`}
                        />
                    </button>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center gap-4">
                    <div>
                        {ad?.isReserved ? (
                            <div className="inline-flex">
                                <span className="bg-bg-3 border border-bg-3 text-gray-400 font-bold text-xl md:text-2xl px-3 py-1 rounded-lg">
                                    Rezervisano
                                </span>
                            </div>
                        ) : (
                            <p className="text-[#6366f1] text-3xl font-bold">
                                {(() => {
                                    const salaryAttr = ad?.attributes?.salary;
                                    const hasSalary = salaryAttr && (salaryAttr.max || salaryAttr.min);
                                    const isJob = ad?.isJob || (ad?.category && isJobsCategory(ad.category, categories)) || hasSalary;

                                    if (ad?.isReserved) return null;

                                    if (isJob) {
                                        const salaryVal = ad?.price || (salaryAttr && (salaryAttr.max || salaryAttr.min));
                                        if (ad?.isPriceOnRequest) return "Plata na upit";
                                        if (salaryVal) {
                                            const formatted = Number(salaryVal).toLocaleString("de-DE");
                                            return <span>{formatted} <span className="text-2xl">€</span> <span className="text-lg font-medium text-gray-400">/ mes.</span></span>;
                                        }
                                        return "Plata na upit";
                                    }

                                    if (ad?.isPriceOnRequest) return "Cena na upit";
                                    if (ad?.price === 0) return "Poklanjam";
                                    if (ad?.price) return <span>{ad.price.toLocaleString("de-DE")} <span className="text-2xl">€</span></span>;
                                    return "Po dogovoru";
                                })()}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1 text-gray-400 w-full">
                        <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 md:w-5 md:h-5 opacity-70 mt-0.5" />
                            <div className="flex flex-col">
                                <span className="text-sm md:text-base">{ad?.country || "Srbija"}, {ad?.city}</span>
                                {ad?.address && ad.showAddress !== false && (
                                    <span className="text-sm md:text-base">{ad.address}</span>
                                )}
                            </div>
                        </div>
                        {mounted && ad?.createdAt && (
                            <div className="flex justify-between items-center w-full mt-1">
                                <span className="text-sm md:text-base flex items-center gap-2">
                                    <Clock className="w-4 h-4 md:w-5 md:h-5 opacity-70" />
                                    {formatRelativeTime(ad.createdAt)}
                                </span>
                                <button
                                    onClick={handleShare}
                                    className="p-1 text-text-main cursor-pointer group shrink-0 -mr-1"
                                    title="Podeli oglas"
                                >
                                    <Share2
                                        size={24}
                                        className="transition-all duration-200 opacity-75 group-hover:opacity-100"
                                    />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const AdvertiserAndContactBox = ({ isSidebar = false }: { isSidebar?: boolean }) => (
        <div className="bg-bg-2 rounded-3xl p-6 md:p-8 border border-bg-3 flex flex-col">
            <Link href={`/${ad?.user?.username}`} className="flex items-center gap-4 mb-6 cursor-pointer">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-bg-1 rounded-full flex items-center justify-center overflow-hidden border border-bg-3 shrink-0">
                    <Image
                        src={ad?.user?.profileImg?.split("|||")[0] || UserAvatar}
                        alt={ad?.user?.fullName || "Korisnik"}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex flex-col justify-center min-w-0">
                    <span className="font-bold text-lg text-text-main truncate">{ad?.user?.fullName || "Korisnik"}</span>
                    <p className="text-gray-400 text-sm">@{ad?.user?.username || "korisnik"}</p>
                </div>
            </Link>

            <Link
                href={`/${ad?.user?.username}`}
                className="w-full mb-6 bg-bg-3 hover:bg-bg-3/80 text-text-main font-bold py-3 rounded-full transition-colors flex items-center justify-center text-sm md:text-base cursor-pointer decoration-none text-center"
            >
                Svi oglasi ovog oglašivača
            </Link>

            {!ad?.isReserved && (
                <div className="flex flex-col gap-3 w-full">
                    {isOwner ? (
                        <>
                        <button
                            onClick={() => router.push(`/ad/edit/form?adId=${ad?.id}`)}
                            className="w-full bg-[#5b42f3] text-white font-bold py-3 rounded-full hover:bg-[#4b35d6] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <SquarePen size={20} className="w-5 h-5" />
                            Uredi oglas
                        </button>
                        <button
                            onClick={() => router.push(`/ad/edit/promotion?adId=${ad?.id}`)}
                            className="w-full bg-[#5b42f3] hover:bg-[#4b35d6] text-white font-bold py-3 rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Megaphone size={20} className="w-5 h-5" />
                            Promoviši
                        </button>
                        </>
                    ) : (
                        !isDeactivated && (
                            <button
                                onClick={isContactBlocked ? undefined : handleContactSeller}
                                disabled={isContactBlocked}
                                className={`w-full font-bold py-3 rounded-full transition-colors flex items-center justify-center gap-2 ${isContactBlocked
                                    ? 'bg-bg-3 text-gray-500 cursor-not-allowed opacity-60'
                                    : 'bg-[#5b42f3] text-white hover:bg-[#4b35d6] cursor-pointer'
                                    }`}
                            >
                                <MessageCircle className="w-5 h-5" />
                                Pošalji poruku
                            </button>
                        )
                    )}
                    {ad?.phone && ad.showPhone !== false && !isOwner && !isDeactivated && (
                        isContactBlocked ? (
                            <button
                                disabled
                                className="w-full bg-bg-3 text-gray-500 font-bold py-3 rounded-full flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
                            >
                                <Phone className="w-5 h-5" />
                                Pozovi
                            </button>
                        ) : (
                            <CallButton phone={ad.phone} />
                        )
                    )}
                </div>
            )}
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-bg-1 text-text-main pb-20">
            <div className="w-full px-4 max-w-[1200px] mx-auto py-5 md:py-7">

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* LEFT COLUMN */}
                    <div className="w-full md:w-[70%] space-y-6">

                        {/* DEACTIVATED NOTICE */}
                        {!loading && isDeactivated && (
                            <div className="bg-bg-2 border border-bg-3 rounded-full py-3 px-4 md:px-6 flex items-center justify-center">
                                <span className="text-red-400 text-sm font-medium text-center">
                                    Nažalost, ovaj oglas više nije aktivan.
                                </span>
                            </div>
                        )}

                        {/* BREADCRUMB */}
                        {loading && (
                            <div className="bg-bg-2 border border-bg-3 rounded-full py-3.5 px-4 md:px-6 animate-pulse">
                                <div className="h-4 bg-bg-3/40 rounded-full w-48" />
                            </div>
                        )}
                        {!loading && categoryPath.length > 0 && (
                            <div className="relative">
                                <div className="bg-bg-2 border border-bg-3 rounded-full py-3 px-4 md:px-6 overflow-x-auto no-scrollbar">
                                    <div className="flex items-center gap-1.5 whitespace-nowrap min-w-0">
                                        <Link href="/" className="text-gray-400 hover:text-text-main text-sm transition-colors shrink-0">Početna</Link>
                                        {categoryPath.map((crumb, idx) => (
                                            <span
                                                key={idx}
                                                className="flex items-center gap-1.5 shrink-0"
                                            >
                                                <span className="text-gray-500 text-sm">›</span>
                                                <Link
                                                    href={`/search/${crumb.slug}`}
                                                    className="text-gray-400 hover:text-text-main text-sm transition-colors"
                                                >
                                                    {crumb.name}
                                                </Link>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 1. UNIFIED GALLERY */}
                        <div className="space-y-4">
                            <div className="relative group w-full aspect-[4/3] bg-bg-2 rounded-3xl overflow-hidden border border-bg-3 shadow-none">
                                {loading ? (
                                    <div className="w-full h-full bg-bg-3/20 animate-pulse" />
                                ) : hasImages ? (
                                    <>
                                        {/* Main Gallery Area */}
                                        <div className="absolute inset-0">
                                            <SwipeableGallery
                                                images={images}
                                                currentIndex={imageIndex}
                                                onNext={nextImage}
                                                onPrev={prevImage}
                                                onClick={() => openGallery(imageIndex)}
                                                isModal={false}
                                            />
                                        </div>

                                        {/* Counter Pill */}
                                        <div className="absolute top-4 left-4 pointer-events-none z-10">
                                            <div className="text-white font-bold text-xs md:text-sm bg-black/50 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 md:px-4 md:py-1.5 pointer-events-auto">
                                                {imageIndex + 1} / {images.length}
                                            </div>
                                        </div>

                                        {/* Arrow Controls (Visible only on desktop/hover, hidden when only 1 image) */}
                                        {images.length > 1 && (
                                            <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/50 backdrop-blur-md border border-white/10 hover:bg-black/70 text-white rounded-full transition-all cursor-pointer z-10"
                                                >
                                                    <ChevronLeft size={24} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/50 backdrop-blur-md border border-white/10 hover:bg-black/70 text-white rounded-full transition-all cursor-pointer z-10"
                                                >
                                                    <ChevronRight size={24} />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Image src={NoImage} alt="No Image" fill className="object-cover" />
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* 2. MOBILE ONLY: Ad Header Info */}
                        <div className="md:hidden">
                            {loading ? (
                                <div className="bg-bg-2 rounded-3xl p-6 md:p-8 border border-bg-3 space-y-4 animate-pulse">
                                    <div className="h-7 bg-bg-3/50 rounded-full w-3/4 mb-4" />
                                    <div className="h-8 bg-bg-3/60 rounded-full w-1/3 mb-6" />
                                    <div className="h-4 bg-bg-3/40 rounded-full w-1/2" />
                                    <div className="h-4 bg-bg-3/30 rounded-full w-1/3" />
                                </div>
                            ) : (
                                <AdHeaderInfo />
                            )}
                        </div>

                        {/* 4. DETAILS BOXES */}
                        <div className="space-y-6">
                            {loading ? (
                                <div className="space-y-6">
                                    <div className="bg-bg-2 rounded-3xl border border-bg-3 p-6 md:p-8 animate-pulse space-y-6">
                                        <div className="h-6 bg-bg-3/50 rounded-full w-48 mb-4" />
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {[...Array(6)].map((_, i) => (
                                                <div key={i} className="h-10 bg-bg-3/30 rounded-2xl w-full" />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-bg-2 rounded-3xl border border-bg-3 p-6 md:p-8 animate-pulse h-48 flex flex-col space-y-4">
                                        <div className="h-6 bg-bg-3/50 rounded-full w-24" />
                                        <div className="h-4 bg-bg-3/30 rounded-full w-full" />
                                        <div className="h-4 bg-bg-3/30 rounded-full w-5/6" />
                                        <div className="h-4 bg-bg-3/30 rounded-full w-2/3" />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Main Attributes Box */}
                                    <div className="bg-bg-2 rounded-3xl border border-bg-3 p-6 md:p-8">
                                        <h2 className="text-xl font-bold mb-6">Detalji oglasa</h2>
                                        {(() => {
                                            const detailsItems: React.ReactNode[] = [];
                                            // Kategorija je prikazana u breadcrumbu iznad galerije

                                            Object.entries(ad?.attributes || {}).filter(([key]) => !["safety", "equipment", "extra-info", "salary", "salary-type", "isContact", "isPriceOnRequest", "condition"].includes(key)).forEach(([key, val]: [string, any]) => {
                                                if (val === null || val === undefined) return;
                                                const filterDef = filters.find((f: any) => f.slug === key);
                                                const label = filterDef ? (filterDef.name || filterDef.label) : key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');

                                                let displayVal = "";
                                                if (Array.isArray(val)) {
                                                    displayVal = val.map(v => {
                                                        if (typeof v === "object" && v !== null) return v.label || v.name || v.slug || JSON.stringify(v);
                                                        if (filterDef && filterDef.options) {
                                                            const opt = filterDef.options.find((o: any) => (o.slug || o.name || o) === v);
                                                            return opt ? (opt.name || opt) : v;
                                                        }
                                                        return v;
                                                    }).join(", ");
                                                } else if (typeof val === "object" && val !== null) {
                                                    if (val.amount !== undefined && val.unit) {
                                                        const amount = Number(val.amount);
                                                        if (val.unit.toLowerCase() === "kw") {
                                                            const ps = Math.round(amount * 1.35962);
                                                            displayVal = `${amount} kW / ${ps} KS`;
                                                        } else if (val.unit.toLowerCase() === "ps" || val.unit.toLowerCase() === "ks") {
                                                            const kw = Math.round(amount / 1.35962);
                                                            displayVal = `${amount} KS / ${kw} kW`;
                                                        } else {
                                                            displayVal = `${amount} ${val.unit}`;
                                                        }
                                                    } else {
                                                        displayVal = val.label || val.name || val.slug || JSON.stringify(val);
                                                    }
                                                } else {
                                                    if (filterDef && filterDef.options) {
                                                        const opt = filterDef.options.find((o: any) => (o.slug || o.name || o) === val);
                                                        displayVal = opt ? (opt.name || opt) : val.toString();
                                                    } else {
                                                        displayVal = val.toString();
                                                    }
                                                }

                                                if (!displayVal || displayVal === "null") return;

                                                detailsItems.push(
                                                    <div key={key} className="flex items-start gap-2 py-0.5">
                                                        <span className="text-gray-400 text-sm font-medium whitespace-nowrap">{label}:</span>
                                                        <span className="text-text-main text-sm font-bold" title={displayVal}>{displayVal}</span>
                                                    </div>
                                                );
                                            });

                                            if (ad?.attributes?.condition) {
                                                detailsItems.push(
                                                    <div key="condition" className="flex items-center gap-2 py-0.5">
                                                        <span className="text-gray-400 text-sm font-medium">Stanje:</span>
                                                        <span className="text-text-main text-sm font-bold capitalize">{ad.attributes.condition.replace("-", " ")}</span>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <>
                                                    <div
                                                        className="relative overflow-hidden transition-all duration-500 ease-in-out"
                                                        style={
                                                            detailsItems.length > 15 && isMobile
                                                                ? { maxHeight: showAllDetails ? `${detailsHeight}px` : '470px' }
                                                                : undefined
                                                        }
                                                    >
                                                        <div
                                                            ref={gridRef}
                                                            className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2"
                                                        >
                                                            {detailsItems}
                                                        </div>
                                                        {detailsItems.length > 15 && (
                                                            <>
                                                                <div className={`md:hidden absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-bg-2 via-bg-2/80 to-transparent pointer-events-none transition-opacity duration-300 ${!showAllDetails ? 'opacity-100' : 'opacity-0'}`} />
                                                                <div className={`md:hidden absolute bottom-2 left-0 right-0 flex justify-center z-10 transition-opacity duration-300 ${!showAllDetails ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                                                    <button
                                                                        onClick={() => setShowAllDetails(true)}
                                                                        className="flex items-center justify-center gap-2 px-6 text-white font-bold py-2.5 rounded-full bg-[#3a3a3c] border border-white/10 hover:bg-[#48484a] transition-all shadow-lg cursor-pointer"
                                                                    >
                                                                        <Plus size={16} /> Prikaži više
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                    {detailsItems.length > 15 && showAllDetails && (
                                                        <div className="md:hidden mt-4 flex justify-center">
                                                            <button
                                                                onClick={() => setShowAllDetails(false)}
                                                                className="flex items-center justify-center gap-2 px-6 text-white font-bold py-2.5 rounded-full bg-[#3a3a3c] border border-white/10 hover:bg-[#48484a] transition-all shadow-lg cursor-pointer"
                                                            >
                                                                <Minus size={16} /> Prikaži manje
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>

                                    {/* Merged Special Groups Box */}
                                    {(() => {
                                        const groups = ["extra-info", "equipment", "safety"].map(key => {
                                            const val = ad?.attributes?.[key];
                                            if (!val) return null;

                                            const filterDef = filters.find((f: any) => f.slug === key);
                                            const label = filterDef ? (filterDef.name || filterDef.label) : (key === "safety" ? "Sigurnost" : key === "equipment" ? "Oprema" : "Dodatne informacije");

                                            let items: string[] = [];
                                            if (Array.isArray(val)) {
                                                items = val.map(v => {
                                                    if (typeof v === "object" && v !== null) return v.label || v.name;
                                                    if (filterDef && filterDef.options) {
                                                        const opt = filterDef.options.find((o: any) => (o.slug || o.name || o) === v);
                                                        return opt ? (opt.name || opt) : v;
                                                    }
                                                    return v;
                                                });
                                            } else if (typeof val === "object" && val !== null) {
                                                items = [val.label || val.name || val.slug || JSON.stringify(val)];
                                            } else {
                                                items = [val.toString()];
                                            }

                                            items = items.filter(Boolean);
                                            if (items.length === 0) return null;

                                            return { key, label, items };
                                        }).filter(Boolean) as { key: string, label: string, items: string[] }[];

                                        if (groups.length === 0) return null;

                                        return (
                                            <div className="bg-bg-2 rounded-3xl border border-bg-3 overflow-hidden">
                                                {groups.map((group, idx) => (
                                                    <div key={group.key}>
                                                        {idx > 0 && (
                                                            <div className="px-6 md:px-8">
                                                                <div className="h-px bg-bg-3 w-full opacity-50" />
                                                            </div>
                                                        )}
                                                        <div className="p-6 md:p-8">
                                                            <h3 className="text-lg font-bold mb-5">{group.label}</h3>
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                                                                {group.items.map((item, i) => (
                                                                    <div key={i} className="text-text-main opacity-80 text-[15px]">
                                                                        {item}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()}

                                    {/* Description Box */}
                                    <div className="bg-bg-2 rounded-3xl border border-bg-3 p-6 md:p-8">
                                        <h3 className="text-xl font-bold mb-6">Opis</h3>
                                        <div
                                            className="relative transition-all duration-500 ease-in-out overflow-hidden"
                                            style={isDescLong ? { maxHeight: showFullDesc ? `${descHeight + 20}px` : '300px' } : undefined}
                                        >
                                            <div
                                                ref={descRef}
                                                className="text-text-main opacity-80 leading-relaxed editor-content-view"
                                                dangerouslySetInnerHTML={{ __html: linkifyUrls(ad?.description || "") }}
                                            />
                                            {/* Gradient shadow fade — semi-transparent like /ai input area */}
                                            <div className={`absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-2 via-bg-2/80 to-transparent pointer-events-none transition-opacity duration-500 ${!showFullDesc && isDescLong ? 'opacity-100' : 'opacity-0'}`} />
                                            {/* Floating button inside the fade */}
                                            {isDescLong && (
                                                <div className={`absolute bottom-0 left-0 right-0 flex justify-center pb-0.5 transition-opacity duration-500 ${showFullDesc ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                                                    <button
                                                        onClick={() => setShowFullDesc(true)}
                                                        className="flex items-center justify-center gap-2 px-6 text-white font-bold py-2.5 rounded-full bg-bg-3/70 backdrop-blur-sm border border-white/10 hover:bg-bg-3 transition-all shadow-lg cursor-pointer"
                                                    >
                                                        <Plus size={16} /> Prikaži više
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        {/* Show less button — appears below content when expanded */}
                                        {isDescLong && showFullDesc && (
                                            <div className="mt-4 flex justify-center">
                                                <button
                                                    onClick={() => setShowFullDesc(false)}
                                                    className="flex items-center justify-center gap-2 px-6 text-white font-bold py-2.5 rounded-full bg-bg-3/70 backdrop-blur-sm border border-white/10 hover:bg-bg-3 transition-all shadow-lg cursor-pointer"
                                                >
                                                    <Minus size={16} /> Prikaži manje
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* 3. MOBILE: Advertiser & Contact (Moved here) */}
                        <div className="block md:hidden">
                            {loading ? (
                                <div className="bg-bg-2 rounded-3xl p-6 md:p-8 border border-bg-3 flex flex-col space-y-4 animate-pulse">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-bg-3/40 shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-5 bg-bg-3/50 rounded-full w-3/4" />
                                            <div className="h-4 bg-bg-3/30 rounded-full w-1/2" />
                                        </div>
                                    </div>
                                    <div className="h-11 bg-bg-3/40 rounded-full w-full mt-2" />
                                    <div className="h-11 bg-bg-3/50 rounded-full w-full" />
                                    <div className="h-11 bg-bg-3/40 rounded-full w-full" />
                                </div>
                            ) : (
                                <AdvertiserAndContactBox />
                            )}
                        </div>

                        {/* 5. MAP */}
                        <div className="rounded-3xl overflow-hidden h-[260px] border border-bg-3 bg-bg-2">
                            {loading ? (
                                <div className="w-full h-full animate-pulse flex items-center justify-center"><MapPin className="w-10 h-10 text-bg-3" /></div>
                            ) : (ad?.lat && ad?.lng && ad.showAddress !== false) ? (
                                <AdMap lat={ad.lat} lng={ad.lng} label={ad.address || ad.city} street={ad.address} adId={ad?.id} adSlug={adSlug} />
                            ) : (ad?.city && cityCoords[ad.city]) ? (
                                <AdMap lat={cityCoords[ad.city].lat} lng={cityCoords[ad.city].lng} label={ad.city} street={null} adId={ad?.id} adSlug={adSlug} />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <MapPin className="w-8 h-8 mb-2 text-[#6366f1]" />
                                    <span>Lokacija: {ad?.city}</span>
                                </div>
                            )}
                        </div>

                        {loading && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-0 p-4 md:py-3.5 md:px-6 rounded-3xl md:rounded-full bg-bg-2 border border-bg-3 animate-pulse items-center">
                                <div className="flex justify-center md:justify-start">
                                    <div className="h-4 bg-bg-3/40 rounded-full w-24" />
                                </div>
                                <div className="flex justify-center">
                                    <div className="h-4 bg-bg-3/30 rounded-full w-36" />
                                </div>
                                <div className="flex justify-center md:justify-end">
                                    <div className="h-4 bg-bg-3/40 rounded-full w-16" />
                                </div>
                            </div>
                        )}
                        {!loading && ad && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-0 p-4 md:py-3 md:px-6 rounded-3xl md:rounded-full bg-bg-2 border border-bg-3 text-center text-xs md:text-sm text-gray-400 items-center">
                                <div className="md:text-left">
                                    <span>Galset kod: </span>
                                    <span>{ad.id}</span>
                                </div>
                                <div className="md:text-center">
                                    <span>Poslednja izmena: </span>
                                    <span>{formatDateTime(ad.updatedAt || ad.createdAt)}</span>
                                </div>
                                <div className="md:text-right flex justify-center md:justify-end">
                                    <button
                                        onClick={() => {
                                            if (!user) {
                                                router.push("/auth");
                                            } else {
                                                setShowReportModal(true);
                                            }
                                        }}
                                        className="text-red-500 hover:underline font-bold cursor-pointer text-center md:text-right w-fit"
                                    >
                                        Prijavi oglas
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>

                    <aside className="hidden md:block md:w-[30%] sticky top-[20px] space-y-6">
                        {loading ? (
                            <div className="space-y-6 animate-pulse">
                                {/* AdHeaderInfo skeleton */}
                                <div className="bg-bg-2 rounded-3xl p-6 md:p-8 border border-bg-3 space-y-4">
                                    <div className="h-7 bg-bg-3/50 rounded-full w-3/4 mb-4" />
                                    <div className="h-8 bg-bg-3/60 rounded-full w-1/3 mb-6" />
                                    <div className="h-4 bg-bg-3/40 rounded-full w-1/2" />
                                    <div className="h-4 bg-bg-3/30 rounded-full w-1/3" />
                                </div>
                                {/* AdvertiserAndContactBox skeleton */}
                                <div className="bg-bg-2 rounded-3xl p-6 md:p-8 border border-bg-3 flex flex-col space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-bg-3/40 shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-5 bg-bg-3/50 rounded-full w-3/4" />
                                            <div className="h-4 bg-bg-3/30 rounded-full w-1/2" />
                                        </div>
                                    </div>
                                    <div className="h-11 bg-bg-3/40 rounded-full w-full mt-2" />
                                    <div className="h-11 bg-bg-3/50 rounded-full w-full" />
                                    <div className="h-11 bg-bg-3/40 rounded-full w-full" />
                                </div>
                            </div>
                        ) : (
                            <>
                                <AdHeaderInfo />
                                <AdvertiserAndContactBox isSidebar />
                            </>
                        )}
                    </aside>
                </div>

                {/* Sticky Mobile (Bottom) */}
                <AnimatePresence>
                    {showSticky && !loading && !ad?.isReserved && (!isDeactivated || isOwner) && (
                        <motion.div
                            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                            className={`md:hidden fixed left-0 right-0 px-4 py-3 z-[150] bg-transparent ${user ? 'bottom-[60px]' : 'bottom-0'}`}
                        >
                            {isOwner ? (
                                <button onClick={() => router.push(`/ad/edit/form?adId=${ad?.id}`)} className="w-full bg-[#5b42f3] hover:bg-[#4b35d6] text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 shadow-lg"><SquarePen size={20} />Uredi oglas</button>
                            ) : (
                                <div className="flex gap-3">
                                    {ad?.phone && ad.showPhone !== false && !isContactBlocked && <StickyCallButton phone={ad.phone} />}
                                    <button
                                        onClick={isContactBlocked ? undefined : handleContactSeller} disabled={isContactBlocked}
                                        className={`flex-1 font-bold py-3 rounded-full flex items-center justify-center gap-2 shadow-lg ${isContactBlocked ? 'bg-bg-3 text-gray-500 cursor-not-allowed' : 'bg-[#5b42f3] hover:bg-[#4b35d6] text-white shadow-xl'}`}
                                    >
                                        <MessageCircle className="w-5 h-5" />Pošalji poruku
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* RECOMMENDED */}
                {ad && <RecommendedAds currentAdId={ad.id} wishlistIds={wishlistIds} onWishlistToggle={handleWishlistToggle} currentUser={user} />}
            </div>

            <GalleryModal
                isOpen={showGallery}
                onClose={closeGallery}
                images={images}
                imageIndex={imageIndex}
                onNext={nextImage}
                onPrev={prevImage}
                onSelectIndex={(idx) => setPage([idx, idx > imageIndex ? 1 : -1])}
                direction={direction}
                page={page}
            />

            {/* Modals */}
            <ReportAdModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                adTitle={ad?.title}
                adPrice={ad?.price}
                adCurrency={ad?.currency}
                adImage={ad?.images?.[0]}
                adId={ad?.id}
            />
        </div>
    )
}
