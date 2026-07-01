"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Search, Clock } from "lucide-react";
import AdsGrid from "@/components/ads/AdsGrid";
import PaginationControls from "@/components/PaginationControls";

interface HistoryClientProps {
    initialAds: any[];
    initialTotal: number;
    initialViewMode?: 'grid' | 'list';
}

export default function HistoryClient({ initialAds, initialTotal, initialViewMode = 'grid' }: HistoryClientProps) {
    const { user, sessionToken } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams?.get("search") || "");
    const [sortBy, setSortBy] = useState(searchParams?.get("sort") || "Najnovije");

    const [ads, setAds] = useState<any[]>(initialAds || []);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [wishlistIds, setWishlistIds] = useState<number[]>([]);
    const [totalAds, setTotalAds] = useState(initialTotal || 0);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
    const [adsPerPage, setAdsPerPage] = useState(30);
    const [hasMore, setHasMore] = useState(initialAds?.length === 30);

    useEffect(() => {
        const saved = localStorage.getItem('galset_view_history');
        if (saved === 'grid' || saved === 'list') {
            setViewMode(saved);
            document.cookie = `galset_view_history=${saved};path=/;max-age=31536000;SameSite=Lax`;
        } else {
            document.cookie = `galset_view_history=${initialViewMode};path=/;max-age=31536000;SameSite=Lax`;
        }
    }, [initialViewMode]);

    useEffect(() => {
        const savedCount = localStorage.getItem('historyAdsPerPage');
        if (savedCount) {
            setAdsPerPage(parseInt(savedCount));
            setHasMore(initialAds?.length === parseInt(savedCount));
        }
    }, [initialAds]);

    const updateUrl = (updates: Record<string, string | null>) => {
        const nextParams = new URLSearchParams(searchParams?.toString());
        nextParams.delete("page");
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null) nextParams.delete(key);
            else nextParams.set(key, value);
        });
        router.push(`${window.location.pathname}?${nextParams.toString()}`);
    };

    const handleSearchChange = (val: string) => {
        setSearch(val);
        setPage(1);
        updateUrl({ search: val || null });
    };

    const toggleViewMode = () => {
        const newMode = viewMode === 'list' ? 'grid' : 'list';
        setViewMode(newMode);
        localStorage.setItem('galset_view_history', newMode);
        document.cookie = `galset_view_history=${newMode};path=/;max-age=31536000;SameSite=Lax`;
    };

    const handleAdsPerPageChange = (val: number) => {
        setAdsPerPage(val);
        setPage(1);
        localStorage.setItem('historyAdsPerPage', val.toString());
    };

    useEffect(() => {
        const fetchWishlist = async () => {
            if (!user?.id) return;
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist?limit=100`);
                if (!res.ok) return;
                const data = await res.json();
                if (data.success) {
                    setWishlistIds(data.ads.map((a: any) => a.id));
                }
            } catch (err) {
                console.error("Failed to fetch wishlist:", err);
            }
        };
        fetchWishlist();
    }, [user?.id]);

    const initialSearchRef = useRef(search);
    const initialSortByRef = useRef(sortBy);
    const initialPageRef = useRef(page);
    const initialAdsPerPageRef = useRef(adsPerPage);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user?.id) return;

            if (
                search === initialSearchRef.current &&
                sortBy === initialSortByRef.current &&
                page === initialPageRef.current &&
                adsPerPage === initialAdsPerPageRef.current
            ) {
                return;
            }

            setLoading(true);

            try {
                let apiSort = "new";
                if (sortBy === "Jeftinije") apiSort = "price_low";
                else if (sortBy === "Skuplje") apiSort = "price_high";

                const headers: Record<string, string> = {};
                if (sessionToken) {
                    headers["Authorization"] = `Bearer ${sessionToken}`;
                }
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/history?search=${search}&page=${page}&limit=${adsPerPage}&sort=${apiSort}`, {
                    headers
                });
                const data = await res.json();
                if (data.success) {
                    setAds(data.ads);
                    setTotalAds(data.total || 0);
                    setHasMore(data.ads.length === adsPerPage);
                }
            } catch (err) {
                console.error("Error fetching history:", err);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchHistory, (page === 1 && search) ? 500 : 0);
        return () => clearTimeout(timeoutId);
    }, [user?.id, search, sortBy, page, adsPerPage]);

    const handleWishlistToggle = async (adId: number) => {
        if (!user) {
            router.push("/auth");
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adId }),
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            if (data.success) {
                if (data.action === "added") {
                    setWishlistIds(prev => [...prev, adId]);
                } else {
                    setWishlistIds(prev => prev.filter(id => id !== adId));
                }
                window.dispatchEvent(new Event("wishlistUpdate"));
            }
        } catch (err) {
            console.error("Failed to toggle wishlist:", err);
        }
    };

    return (
        <div className="min-h-screen bg-bg-1 text-text-main">
            <div className="w-full max-w-[1000px] mx-auto px-4 md:px-6 pt-2 pb-6">
                <h1 className="text-text-main text-xl sm:text-2xl font-bold mt-4 mb-2 text-center">Nedavno pregledano</h1>

                <div className="max-w-[800px] mx-auto w-full flex justify-center pt-4 pb-8 md:pt-6 md:pb-12">
                    <div className="w-full relative">
                        <input
                            type="text"
                            placeholder="Pretraži moju istoriju..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full bg-bg-2 border border-bg-3 rounded-full py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                </div>

                {loading ? (
                    <AdsGrid ads={[]} loading={true} wishlistIds={[]} onWishlistToggle={() => { }} currentUser={user} columns={3} viewMode={viewMode} />
                ) : ads.length > 0 ? (
                    <>
                        <AdsGrid
                            ads={ads}
                            loading={false}
                            wishlistIds={wishlistIds}
                            onWishlistToggle={handleWishlistToggle}
                            currentUser={user}
                            columns={3}
                            viewMode={viewMode}
                        />

                        <PaginationControls
                            page={page}
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
                ) : (
                    <div className="col-span-full text-center py-20 w-full flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-bg-2 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-bold">Prazna istorija</h3>
                        <p className="text-gray-400 text-sm mt-1">
                            {search ? "Nismo pronašli oglase koji odgovaraju pretrazi." : "Trenutno nemate pregledanih oglasa."}
                        </p>
                        {!search && (
                            <Link href="/search" className="mt-6 inline-block bg-bg-2 hover:bg-bg-3 px-6 py-2.5 rounded-full text-sm font-semibold transition-colors">
                                Istraži oglase
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
