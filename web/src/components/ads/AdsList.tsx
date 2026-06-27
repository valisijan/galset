import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { useFilters } from "../filters/useFilters";
import MobileFilters from "../filters/MobileFilters";
import ActiveTags from "../filters/ActiveTags";
import AdsGrid from "./AdsGrid";
import PaginationControls from "../PaginationControls";

export default function AdsList({ 
    section = "marketplace", 
    userId, 
    categoryId, 
    columns,
    initialAds,
    initialWishlistIds,
    initialTotal,
    initialViewMode = 'grid'
}: { 
    section?: string, 
    userId?: number, 
    categoryId?: number, 
    columns?: 3 | 4,
    initialAds?: any[],
    initialWishlistIds?: number[],
    initialTotal?: number,
    initialViewMode?: 'grid' | 'list'
}) {
    const { slug } = useParams() as any;
    const slugArr = Array.isArray(slug) ? slug : (slug ? [slug] : []);
    const currentSlug = slugArr.length > 0 ? slugArr[slugArr.length - 1] : undefined;
    const { user, sessionToken } = useAuth();
    const { activeTags, removeTag, params, setSingle, currentPage, setPage } = useFilters();

    const [ads, setAds] = useState<any[]>(initialAds || []);
    const [wishlistIds, setWishlistIds] = useState<number[]>(initialWishlistIds || []);
    const [loading, setLoading] = useState(!initialAds);
    const [totalAds, setTotalAds] = useState(initialTotal || 0);
    const isFirstRender = useRef(true);

    const [viewMode, setViewMode] = useState<'list' | 'grid'>(initialViewMode);
    const [adsPerPage, setAdsPerPage] = useState(30);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const savedView = localStorage.getItem('galset_view_search');
        const savedCount = localStorage.getItem('adsPerPage');
        if (savedView === 'grid' || savedView === 'list') {
            setViewMode(savedView);
            document.cookie = `galset_view_search=${savedView};path=/;max-age=31536000;SameSite=Lax`;
        } else {
            document.cookie = `galset_view_search=${initialViewMode};path=/;max-age=31536000;SameSite=Lax`;
        }
        if (savedCount) setAdsPerPage(parseInt(savedCount));
    }, [initialViewMode]);

    const toggleViewMode = () => {
        const newMode = viewMode === 'list' ? 'grid' : 'list';
        setViewMode(newMode);
        localStorage.setItem('galset_view_search', newMode);
        document.cookie = `galset_view_search=${newMode};path=/;max-age=31536000;SameSite=Lax`;
    };

    const handleAdsPerPageChange = (val: number) => {
        setAdsPerPage(val);
        localStorage.setItem('adsPerPage', val.toString());
    };

    const fetchWishlist = async () => {
        if (!user) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist`);
            if (!res.ok) throw new Error("Failed to fetch wishlist");
            const data = await res.json();
            if (data.success) {
                setWishlistIds(data.ads.map((a: any) => a.id));
            }
        } catch (err) {
            console.error("Failed to fetch wishlist:", err);
        }
    };

    const filterKey = useMemo(() => {
        const { page: _, filter_modal: __, ...filtersOnly } = params;
        return JSON.stringify({ ...filtersOnly, currentSlug, adsPerPage, userId });
    }, [params, currentSlug, adsPerPage, userId]);

    useEffect(() => {
        if (currentPage !== 1) {
            setPage(1);
        }
    }, [filterKey]);

    const initialFilterKeyRef = useRef(filterKey);
    const initialPageRef = useRef(currentPage);

    useEffect(() => {
        fetchWishlist();

        if (
            currentPage === initialPageRef.current &&
            filterKey === initialFilterKeyRef.current &&
            initialAds
        ) {
            return;
        }

        const fetchAds = async () => {
            setLoading(true);
            try {
                const solvedCategory = currentSlug || "all-ads";
                const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/ads`, window.location.origin);
                url.searchParams.set("category", solvedCategory);

                Object.entries(params).forEach(([key, value]) => {
                    if (key !== "category" && key !== "page" && key !== "filter_modal" && value) {
                        url.searchParams.set(key, value);
                    }
                });

                if (userId) url.searchParams.set("userId", userId.toString());
                url.searchParams.set("limit", adsPerPage.toString());
                url.searchParams.set("page", currentPage.toString());

                const headers: Record<string, string> = {};
                if (sessionToken) {
                    headers["Authorization"] = `Bearer ${sessionToken}`;
                }
                const res = await fetch(url.toString(), { headers });
                if (!res.ok) throw new Error("Failed to fetch ads");
                const data = await res.json();
                if (data.success) {
                    setAds(data.ads);
                    setTotalAds(data.total || data.ads.length);
                    setHasMore(data.ads.length === adsPerPage);

                    if (currentPage > 1) {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                }
            } catch (err) {
                console.error("Failed to fetch ads:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAds();
        fetchWishlist();
    }, [filterKey, currentPage, user?.id]);

    const handleWishlistToggle = async (adId: number) => {
        if (!user) {
            window.dispatchEvent(new Event("open-auth-modal"));
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adId }),
            });
            if (!res.ok) throw new Error("Failed to update wishlist");
            const data = await res.json();
            if (data.success) {
                if (data.action === "added") {
                    setWishlistIds(prev => [...prev, adId]);
                } else {
                    setWishlistIds(prev => prev.filter(id => id !== adId));
                }
                window.dispatchEvent(new CustomEvent("wishlistUpdate"));
            }
        } catch (err) {
            toast.error("Greška pri ažuriranju liste želja");
        }
    };

    return (
        <div className="w-full flex flex-col gap-4">
            {/* Desktop Header */}
            <div className="hidden lg:flex flex-col gap-4 mb-2">
                <div className="flex flex-wrap gap-2">
                    <ActiveTags />
                </div>
            </div>

            {/* Content Area */}
            <>
                {loading ? (
                    // LOADING STATE
                    <AdsGrid ads={[]} loading={true} wishlistIds={[]} onWishlistToggle={() => { }} currentUser={null} columns={columns} viewMode={viewMode} />
                ) : ads.length > 0 ? (
                    // ACTUAL CONTENT
                    <AdsGrid
                        ads={ads}
                        loading={false}
                        wishlistIds={wishlistIds}
                        onWishlistToggle={handleWishlistToggle}
                        currentUser={user}
                        section={section}
                        columns={columns}
                        viewMode={viewMode}
                    />
                ) : (
                    // NO RESULTS
                    <div className="py-20 text-center bg-bg-1 rounded-3xl border border-dashed border-bg-2">
                        <div className="mb-4 flex justify-center">
                            <div className="w-16 h-16 bg-bg-1 rounded-full flex items-center justify-center">
                                <Search size={32} className="text-text-main opacity-20" />
                            </div>
                        </div>
                        <p className="text-gray-400 text-lg">Nema pronađenih oglasa.</p>
                    </div>
                )}

                <PaginationControls
                    page={currentPage}
                    setPage={setPage}
                    adsPerPage={adsPerPage}
                    onAdsPerPageChange={handleAdsPerPageChange}
                    totalAds={totalAds}
                    hasMore={hasMore}
                    loading={loading}
                    showViewMode={true}
                    viewMode={viewMode}
                    onViewModeToggle={toggleViewMode}
                />
            </>
        </div>
    );
}