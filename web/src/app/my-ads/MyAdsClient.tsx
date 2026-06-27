"use client";

import React, { useState, useEffect, useRef } from "react";
const NoImage = "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/assets/no-image.png";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Search, MoreVertical, Edit, Trash2, Power, Share2, RefreshCw, Tag, Heart, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PaginationControls from "@/components/PaginationControls";

const TABS = [
    { id: "active", label: "Aktivni" },
    { id: "deactivated", label: "Deaktivirani" },
    { id: "draft", label: "Nacrti" },
    { id: "expired", label: "Istekli" }
];

import RenewAdModal from "./RenewAdModal";
import DeleteAdModal from "./DeleteAdModal";
import DeleteDraftModal from "./DeleteDraftModal";
import SetReservedModal from "./SetReservedModal";
import SetAvailableModal from "./SetAvailableModal";
import DeactivateAdModal from "./DeactivateAdModal";
import ActivateAdModal from "./ActivateAdModal";
import Loader from "@/components/Loader";
import AdCardList from "@/components/ads/AdCardList";

import MoreMenu from "./MoreMenu";

const formatAdDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const adDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (adDate.getTime() === today.getTime()) {
        return "danas";
    } else if (adDate.getTime() === yesterday.getTime()) {
        return "juče";
    } else {
        const months = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "avg", "sep", "okt", "nov", "dec"];
        return `${date.getDate()}. ${months[date.getMonth()]}`;
    }
};

interface MyAdsClientProps {
    initialAds: any[];
    initialTotal: number;
    action: string;
}

export default function MyAdsClient({ initialAds, initialTotal, action }: MyAdsClientProps) {
    const { user, sessionToken } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [activeTab, setActiveTab] = useState(action || "active");
    const [search, setSearch] = useState(searchParams?.get("search") || "");
    const [sortBy, setSortBy] = useState(searchParams?.get("sort") || "Najnovije");

    const [ads, setAds] = useState<any[]>(initialAds || []);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [totalAds, setTotalAds] = useState(initialTotal || 0);
    const [adsPerPage, setAdsPerPage] = useState(30);
    const [hasMore, setHasMore] = useState(initialAds?.length === 30);
    const tabScrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = tabScrollRef.current;
        if (!container) return;
        const activeBtn = container.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement | null;
        if (activeBtn) {
            const containerWidth = container.offsetWidth;
            const btnLeft = activeBtn.offsetLeft;
            const btnWidth = activeBtn.offsetWidth;
            container.scrollTo({
                left: btnLeft - (containerWidth - btnWidth) / 2,
                behavior: 'smooth'
            });
        }
    }, [activeTab]);

    // initialAds/initialTotal props sync is handled below, after ref declarations

    const handleAdsPerPageChange = (val: number) => {
        setAdsPerPage(val);
        setPage(1);
        localStorage.setItem('myAdsPerPage', val.toString());
    };

    const [adToDelete, setAdToDelete] = useState<any>(null);
    const [draftToDelete, setDraftToDelete] = useState<any>(null);
    const [adToDeactivate, setAdToDeactivate] = useState<any>(null);
    const [adToActivate, setAdToActivate] = useState<any>(null);
    const [adToRenew, setAdToRenew] = useState<any>(null);
    const [adToReserve, setAdToReserve] = useState<any>(null);
    const [adToAvailable, setAdToAvailable] = useState<any>(null);

    const updateUrl = (updates: Record<string, string | null>) => {
        const nextParams = new URLSearchParams(window.location.search);
        nextParams.delete("page");
        nextParams.delete("status");
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null) nextParams.delete(key);
            else nextParams.set(key, value);
        });

        const newUrl = `${window.location.pathname}?${nextParams.toString()}`;
        window.history.pushState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    };

    const handleTabChange = (tab: string) => {
        const nextParams = new URLSearchParams(window.location.search);
        nextParams.delete("page");
        nextParams.delete("status");
        router.push(`/my-ads/${tab}?${nextParams.toString()}`);
    };

    const handleSearchChange = (val: string) => {
        setSearch(val);
        setPage(1);
        updateUrl({ search: val || null });
    };

    const handleSortChange = (val: string) => {
        setSortBy(val);
        setPage(1);
        updateUrl({ sort: val });
    };

    const deleteAd = async (reason: string) => {
        if (!adToDelete) return;
        try {
            const headers: Record<string, string> = {};
            if (sessionToken) {
                headers["Authorization"] = `Bearer ${sessionToken}`;
            }
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads/${adToDelete.id}?reason=${encodeURIComponent(reason)}`, {
                method: "DELETE",
                headers
            });
            const data = await res.json();
            if (data.success) {
                setAds(prev => prev.filter(a => a.id !== adToDelete.id));
                setAdToDelete(null);
            }
        } catch (err) {
            console.error("Failed to delete ad:", err);
        }
    };

    const deleteDraft = async () => {
        if (!draftToDelete) return;
        try {
            const headers: Record<string, string> = {};
            if (sessionToken) {
                headers["Authorization"] = `Bearer ${sessionToken}`;
            }
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads/draft?id=${draftToDelete.id}`, {
                method: "DELETE",
                headers
            });
            const data = await res.json();
            if (data.success) {
                setAds(prev => prev.filter(a => a.id !== draftToDelete.id || a.status !== "DRAFT"));
                setDraftToDelete(null);
            }
        } catch (err) {
            console.error("Failed to delete draft:", err);
        }
    };

    const deactivateAd = async () => {
        if (!adToDeactivate) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads/${adToDeactivate.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "deactivated" })
            });
            const data = await res.json();
            if (data.success) {
                setAds(prev => prev.filter(a => a.id !== adToDeactivate.id));
                setAdToDeactivate(null);
            }
        } catch (err) {
            console.error("Failed to deactivate ad:", err);
        }
    };

    const activateAd = async () => {
        if (!adToActivate) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads/${adToActivate.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "active" })
            });
            const data = await res.json();
            if (data.success) {
                setAds(prev => prev.filter(a => a.id !== adToActivate.id));
                setAdToActivate(null);
            }
        } catch (err) {
            console.error("Failed to activate ad:", err);
        }
    };

    const renewAd = async () => {
        if (!adToRenew) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads/renew`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adId: adToRenew.id })
            });
            const data = await res.json();
            if (data.success) {
                if (activeTab === "active") {
                    setAds(prev => prev.map(a => a.id === adToRenew.id ? { ...a, status: "ACTIVE" } : a));
                } else {
                    setAds(prev => prev.filter(a => a.id !== adToRenew.id));
                }
                setAdToRenew(null);
            } else {
                alert(data.error || "Greška pri obnovi");
            }
        } catch (err) {
            console.error("Failed to renew ad:", err);
        }
    };

    const markAsReserved = async () => {
        if (!adToReserve) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads/reserved`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adId: adToReserve.id, isReserved: true })
            });
            const data = await res.json();
            if (data.success) {
                setAds(prev => prev.map(a => a.id === adToReserve.id ? { ...a, isReserved: true } : a));
                setAdToReserve(null);
            } else {
                alert(data.error || "Greška pri rezervisanju");
            }
        } catch (err) {
            console.error("Failed to mark as reserved:", err);
        }
    };

    const markAsAvailable = async () => {
        if (!adToAvailable) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads/reserved`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adId: adToAvailable.id, isReserved: false })
            });
            const data = await res.json();
            if (data.success) {
                setAds(prev => prev.map(a => a.id === adToAvailable.id ? { ...a, isReserved: false } : a));
                setAdToAvailable(null);
            } else {
                alert(data.error || "Greška pri postavljanju dostupno");
            }
        } catch (err) {
            console.error("Failed to mark as available:", err);
        }
    };

    const initialActiveTabRef = useRef(activeTab);
    const initialSearchRef = useRef(search);
    const initialPageRef = useRef(page);
    const initialSortByRef = useRef(sortBy);
    const initialAdsPerPageRef = useRef(adsPerPage);

    useEffect(() => {
        const savedCount = localStorage.getItem('myAdsPerPage');
        const currentLimit = savedCount ? parseInt(savedCount) : 30;

        setAds(initialAds || []);
        setTotalAds(initialTotal || 0);
        setHasMore((initialAds || []).length === currentLimit);
        if (savedCount) {
            setAdsPerPage(currentLimit);
        }

        const status = action || "active";
        const searchVal = searchParams?.get("search") || "";
        const sortVal = searchParams?.get("sort") || "Najnovije";
        const pageVal = parseInt(searchParams?.get("page") || "1");

        setActiveTab(status);
        setSearch(searchVal);
        setSortBy(sortVal);
        setPage(pageVal);

        initialActiveTabRef.current = status;
        initialSearchRef.current = searchVal;
        initialSortByRef.current = sortVal;
        initialPageRef.current = pageVal;
        initialAdsPerPageRef.current = currentLimit;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialAds, initialTotal, action]);

    useEffect(() => {
        const fetchMyAds = async () => {
            if (!user?.id) return;

            if (
                activeTab === initialActiveTabRef.current &&
                search === initialSearchRef.current &&
                page === initialPageRef.current &&
                sortBy === initialSortByRef.current &&
                adsPerPage === initialAdsPerPageRef.current
            ) {
                return;
            }

            setLoading(true);

            try {
                if (activeTab === "draft") {
                    const headers: Record<string, string> = {};
                    if (sessionToken) {
                        headers["Authorization"] = `Bearer ${sessionToken}`;
                    }
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads/draft?all=true`, { headers });
                    const data = await res.json();
                    if (data.success) {
                        const rawDrafts = data.drafts || (data.draft ? [data.draft] : []);
                        const formatted = rawDrafts.map((d: any) => ({
                            ...d,
                            status: "DRAFT",
                            isReserved: false,
                            viewscount: 0,
                            wishlistcount: 0,
                            messagescount: 0,
                            user: { id: user.id, fullName: "", username: "", profileImg: null },
                            promotions: []
                        }));
                        setAds(formatted);
                        setTotalAds(formatted.length);
                        setHasMore(false);
                    }
                } else {
                    let apiSort = "new";
                    if (sortBy === "Jeftinije") apiSort = "price_low";
                    else if (sortBy === "Skuplje") apiSort = "price_high";

                    const url = `${process.env.NEXT_PUBLIC_API_URL}/ads?userId=${user.id}&status=${activeTab}&search=${search}&page=${page}&limit=${adsPerPage}&sort=${apiSort}`;
                    const res = await fetch(url);
                    const data = await res.json();

                    if (data.success) {
                        setAds(data.ads);
                        setTotalAds(data.total || 0);
                        setHasMore(data.ads.length === adsPerPage);
                    }
                }
            } catch (err) {
                console.error("Error fetching my ads:", err);
            } finally {
                setLoading(false);
            }
        };

        const delay = page === 1 && search ? 300 : 0;

        const timeoutId = setTimeout(fetchMyAds, delay);
        return () => clearTimeout(timeoutId);
    }, [user?.id, activeTab, search, page, sortBy, adsPerPage]);

    return (
        <div className="min-h-screen bg-bg-1 text-text-main">
            <div className="max-w-[800px] mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-8 text-center">Moji oglasi</h1>

                <div className="mb-8">
                    <div
                        ref={tabScrollRef}
                        className="bg-bg-2 p-1 rounded-full border border-bg-3 relative overflow-x-auto no-scrollbar w-fit max-w-full mx-auto md:overflow-visible"
                    >
                        <div className="flex w-fit mx-auto">
                            {TABS.map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        data-tab={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`relative px-5 md:px-6 py-1.5 rounded-full text-sm font-bold transition-colors z-10 cursor-pointer whitespace-nowrap ${isActive
                                            ? "text-white"
                                            : "text-gray-400 hover:text-text-main"
                                            }`}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="myads-active-pill"
                                                className="absolute inset-0 bg-[#5b42f3] hover:bg-[#4b35d6] rounded-full -z-10"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mb-8">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Pretraži moje oglase..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full bg-bg-2 border border-bg-3 rounded-full py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-bg-2 border border-bg-3 rounded-3xl p-1 md:p-2.5 flex gap-3 md:gap-4 relative overflow-hidden animate-pulse">
                                {/* Image Skeleton */}
                                <div className="w-32 h-32 md:w-40 md:h-40 bg-bg-3 rounded-[20px] md:rounded-2xl shrink-0" />

                                {/* Content Skeleton */}
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div className="space-y-2">
                                        <div className="h-5 bg-bg-3 rounded-full w-3/4" />
                                        <div className="h-4 bg-bg-3 rounded-full w-1/4" />
                                    </div>
                                    <div className="space-y-1.5 mt-auto">
                                        <div className="h-3 bg-bg-3 rounded-full w-1/2" />
                                        <div className="h-3 bg-bg-3 rounded-full w-1/3" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : ads.length > 0 ? (
                        ads.map((ad) => (
                            <AdCardList
                                key={`${ad.status}-${ad.id}`}
                                ad={ad}
                                currentUser={user}
                                showStats={true}
                                rightAction={
                                    <MoreMenu
                                        ad={ad}
                                        onDelete={() => {
                                            if (ad.status === "DRAFT") {
                                                setDraftToDelete(ad);
                                            } else {
                                                setAdToDelete(ad);
                                            }
                                        }}
                                        onDeactivate={() => setAdToDeactivate(ad)}
                                        onActivate={() => setAdToActivate(ad)}
                                        onRenew={() => setAdToRenew(ad)}
                                        onReserve={() => setAdToReserve(ad)}
                                        onAvailable={() => setAdToAvailable(ad)}
                                    />
                                }
                            />
                        ))
                    ) : (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-bg-2 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-500" />
                            </div>
                            <h3 className="text-lg font-bold">Nema oglasa</h3>
                            <p className="text-gray-400 text-sm mt-1">
                                {search ? "Nismo pronašli oglase koji odgovaraju pretrazi." : "Trenutno nemate oglasa u ovoj kategoriji."}
                            </p>
                            {!search && activeTab === "active" && (
                                <Link href="/ad/add" className="mt-6 inline-block bg-bg-2 hover:bg-bg-3 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                                    Postavi svoj prvi oglas
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                <PaginationControls
                    page={page}
                    setPage={setPage}
                    adsPerPage={adsPerPage}
                    onAdsPerPageChange={handleAdsPerPageChange}
                    totalAds={totalAds}
                    hasMore={hasMore}
                    loading={loading}
                    showViewMode={false}
                />
            </div>

            <DeleteAdModal
                isOpen={!!adToDelete}
                onClose={() => setAdToDelete(null)}
                onConfirm={deleteAd}
                adTitle={adToDelete?.title || ""}
            />

            <DeleteDraftModal
                isOpen={!!draftToDelete}
                onClose={() => setDraftToDelete(null)}
                onConfirm={deleteDraft}
                adTitle={draftToDelete?.title || ""}
            />

            <DeactivateAdModal
                isOpen={!!adToDeactivate}
                onClose={() => setAdToDeactivate(null)}
                onConfirm={deactivateAd}
                adTitle={adToDeactivate?.title || ""}
            />

            <ActivateAdModal
                isOpen={!!adToActivate}
                onClose={() => setAdToActivate(null)}
                onConfirm={activateAd}
                adTitle={adToActivate?.title || ""}
            />

            <RenewAdModal
                isOpen={!!adToRenew}
                onClose={() => setAdToRenew(null)}
                onConfirm={renewAd}
                adTitle={adToRenew?.title || ""}
            />

            <SetReservedModal
                isOpen={!!adToReserve}
                onClose={() => setAdToReserve(null)}
                onConfirm={markAsReserved}
                adTitle={adToReserve?.title || ""}
            />

            <SetAvailableModal
                isOpen={!!adToAvailable}
                onClose={() => setAdToAvailable(null)}
                onConfirm={markAsAvailable}
                adTitle={adToAvailable?.title || ""}
            />
        </div>
    );
}
