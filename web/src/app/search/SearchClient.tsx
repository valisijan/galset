"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "@/components/SearchBar";
import SearchModeToggle from "@/components/SearchModeToggle";
import AdsGrid from "@/components/ads/AdsGrid";
import AdsList from "@/components/ads/AdsList";
import Filters from "@/components/filters/Filters";
import MobileFilters from "@/components/filters/MobileFilters";
import ActiveTags from "@/components/filters/ActiveTags";
import { useFilters } from "@/components/filters/useFilters";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

import Image from "next/image";

interface SearchClientProps {
    initialAds: any[];
    initialWishlistIds: number[];
    initialTotal: number;
    user: any;
    categories?: any[];
    initialViewMode?: 'grid' | 'list';
    initialFiltersData?: any[];
    initialUseFiltersData?: any;
}

const POPULAR_KEYWORDS_POOL = [
    "Golf 5", "iPhone 15", "Stan", "Patike", "Kuca", "Bicikl", 
    "Audi A4", "Namestaj", "Samsung S24", "Laptop", "Posao", 
    "Smartwatch", "Sony PlayStation 5", "Motor", "Plac", "Usluge", 
    "Alati", "Knjige", "Fitnes oprema", "Gradjevinski materijal", 
    "Kucni ljubimci", "Igracke", "Bicikla", "Gume", "Automobili", 
    "Prodaja", "Iznajmljivanje", "Klima uredjaj", "Dron", "Monitor",
    "BMW", "Mercedes", "Kosilica", "Fotolja", "Sto i stolice", "Slusalice",
    "Golf 6", "Golf 7", "Passat B6", "Audi A6", "BMW E90", "BMW F30",
    "iPhone 14", "iPhone 13 Pro", "Sony PS4", "Stan za izdavanje", 
    "Kuca na prodaju", "Polovni automobili", "Bicikl muski", "Gume zimske", 
    "Felne", "Alat set", "Klima inverter", "Namestaj garnitura", 
    "Trpezarijski sto", "Komoda", "Prikolica", "Kvad", "Nekretnine", 
    "Plac gradjevinski", "Traktor", "Stene", "Zlatni nakit", "Bicikl zenski"
];

function CategoryIcon({ icon, name }: { icon?: string | null; name: string }) {
    const [imgError, setImgError] = useState(false);

    if (icon && !imgError) {
        const src = icon.startsWith("http") ? icon : (icon.startsWith("/") ? icon : `/${icon}`);
        return (
            <Image
                src={src}
                alt={name}
                width={28}
                height={28}
                className="transition"
                onError={() => setImgError(true)}
            />
        );
    }

    return null;
}

export default function SearchClient({
    initialAds,
    initialWishlistIds,
    initialTotal,
    user,
    categories = [],
    initialViewMode = 'grid',
    initialFiltersData,
    initialUseFiltersData,
}: SearchClientProps) {
    const { params, setSingle } = useFilters();
    const [q, setQ] = useState(params["q"] || "");
    const [wishlistIds, setWishlistIds] = useState<number[]>(initialWishlistIds);
    const [sortOpen, setSortOpen] = useState(false);
    const [mobileSortOpen, setMobileSortOpen] = useState(false);

    const isSimpleSearch = useMemo(() => {
        return Object.keys(params).length === 0;
    }, [params]);

    const [popularSearches, setPopularSearches] = useState<string[]>(
        POPULAR_KEYWORDS_POOL.slice(0, 12)
    );

    useEffect(() => {
        const tempPool = [...POPULAR_KEYWORDS_POOL];
        const selected: string[] = [];
        
        for (let i = 0; i < 12; i++) {
            if (tempPool.length === 0) break;
            const index = Math.floor(Math.random() * tempPool.length);
            selected.push(tempPool.splice(index, 1)[0]);
        }
        
        setPopularSearches(selected);
    }, []);

    const { sessionToken } = useAuth();
    const [recommendations, setRecommendations] = useState<{
        categorySections: any[];
        wishlist: any[];
        history: any[];
    } | null>(null);
    const [loadingRecs, setLoadingRecs] = useState(true);

    const fetchRecommendations = async () => {
        try {
            let url = `${process.env.NEXT_PUBLIC_API_URL}/recommendations`;
            const headers: Record<string, string> = {};

            if (user && sessionToken) {
                headers["Authorization"] = `Bearer ${sessionToken}`;
            } else {
                const localHistoryStr = localStorage.getItem("galset_local_history");
                if (localHistoryStr) {
                    const localHistory = JSON.parse(localHistoryStr);
                    if (Array.isArray(localHistory) && localHistory.length > 0) {
                        const categories = localHistory
                            .map((h: any) => h.category)
                            .filter(Boolean)
                            .join(",");
                        if (categories) {
                            url += `?categories=${encodeURIComponent(categories)}`;
                        }
                    }
                }
            }

            const res = await fetch(url, { headers });
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setRecommendations({
                        categorySections: data.categorySections || [],
                        wishlist: data.wishlist || [],
                        history: data.history || []
                    });
                }
            }
        } catch (err) {
            console.error("Failed to fetch recommendations:", err);
        } finally {
            setLoadingRecs(false);
        }
    };

    useEffect(() => {
        if (isSimpleSearch) {
            fetchRecommendations();
        }
    }, [user, sessionToken, isSimpleSearch]);

    const sortRef = useRef<HTMLDivElement>(null);
    const mobileSortRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
                setSortOpen(false);
            }
            if (mobileSortRef.current && !mobileSortRef.current.contains(e.target as Node)) {
                setMobileSortOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

     useEffect(() => {
        setQ(params["q"] || "");
    }, [params]);

    const handleSearch = (term?: string) => {
        const searchValue = term !== undefined ? term : q;
        setSingle("q", searchValue || null);
    };

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
            const data = await res.json();
            if (data.success) {
                if (data.action === "added") {
                    setWishlistIds(prev => [...prev, adId]);
                } else {
                    setWishlistIds(prev => prev.filter(id => id !== adId));
                }
                window.dispatchEvent(new Event("wishlistUpdate"));
                fetchRecommendations();
            }
        } catch (err) {
            console.error("Failed to toggle wishlist:", err);
            toast.error("Greška prilikom čuvanja oglasa");
        }
    };

    return (
        <div className="w-full min-h-screen bg-bg-1 text-text-main">
            <div className={`w-full max-w-[1300px] mx-auto px-4 md:px-6 ${isSimpleSearch ? 'pt-2 pb-6' : 'py-6'}`}>
                {isSimpleSearch ? (
                    <div className="w-full">
                        {/* CENTERED SEARCH BAR */}
                        <div className="w-full flex justify-center pt-4 pb-8 md:pt-6 md:pb-12">
                            <SearchBar
                                value={q}
                                onChange={setQ}
                                onSearch={handleSearch}
                                aiLink="/ai"
                            />
                        </div>

                        {/* SEARCH MODE TOGGLE */}
                        <div className="flex justify-center mb-10 -mt-4 md:-mt-8">
                            <SearchModeToggle activeMode="ads" />
                        </div>

                        {/* POPULAR SEARCHES */}
                        <div className="mb-12 text-left">
                            <h2 className="text-text-main text-xl sm:text-2xl font-bold mb-6">
                                Popularne pretrage
                            </h2>
                            <div className="flex flex-nowrap md:flex-wrap overflow-x-auto md:overflow-x-visible no-scrollbar justify-start gap-2 w-auto md:w-full pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
                                {popularSearches.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => handleSearch(tag)}
                                        className="text-xs sm:text-sm bg-bg-2 border border-bg-3 hover:border-text-muted hover:bg-bg-3 text-text-main px-4 py-2 rounded-full transition-all active:scale-95 cursor-pointer font-medium shrink-0"
                                    >
                                        #{tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* CATEGORIES GRID */}
                        <div className="mb-0">
                            <h2 className="text-text-main text-xl sm:text-2xl font-bold mb-6">
                                Sve kategorije
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {/* Oglasi u blizini */}
                                <Link
                                    href="/search?sort=new&page=1"
                                    className="group flex items-center gap-4 p-4 rounded-3xl bg-bg-2 border border-bg-3 hover:border-gray-400 dark:hover:border-[#555] hover:bg-bg-3 transition-all cursor-pointer"
                                >
                                    <div className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Image
                                            src="https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/icons/location.svg"
                                            alt="Oglasi u blizini"
                                            width={28}
                                            height={28}
                                            className="transition"
                                        />
                                    </div>
                                    <span className="text-text-main text-base font-bold transition group-hover:text-[#6366f1]">
                                        Oglasi u blizini
                                    </span>
                                </Link>

                                {categories.map((cat: any) => {
                                    const isAllAds = cat.slug === "all-ads";
                                    return (
                                        <Link
                                            key={cat.name}
                                            href={
                                                isAllAds
                                                    ? "/search?sort=new&page=1"
                                                    : (cat.subcategories && cat.subcategories.length > 0)
                                                        ? `/categories/${cat.slug}`
                                                        : `/search/${cat.slug}?sort=new&page=1`
                                            }
                                            className="group flex items-center gap-4 p-4 rounded-3xl bg-bg-2 border border-bg-3 hover:border-gray-400 dark:hover:border-[#555] hover:bg-bg-3 transition-all cursor-pointer"
                                        >
                                            <div className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <CategoryIcon icon={cat.icon} name={cat.name} />
                                            </div>
                                            <span className="text-text-main text-base font-bold transition group-hover:text-[#6366f1]">
                                                {cat.name}
                                            </span>
                                        </Link>
                                    );
                                })}

                                {/* Poklanjam */}
                                <Link
                                    href="/search?price_min=0&price_max=0&sort=new&page=1"
                                    className="group flex items-center gap-4 p-4 rounded-3xl bg-bg-2 border border-bg-3 hover:border-gray-400 dark:hover:border-[#555] hover:bg-bg-3 transition-all cursor-pointer"
                                >
                                    <div className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Image
                                            src="https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/icons/gift.svg"
                                            alt="Poklanjam"
                                            width={28}
                                            height={28}
                                            className="transition"
                                        />
                                    </div>
                                    <span className="text-text-main text-base font-bold transition group-hover:text-[#6366f1]">
                                        Poklanjam
                                    </span>
                                </Link>
                            </div>
                        </div>

                        <div className="sticky bottom-[85px] md:bottom-10 z-[90] flex justify-center mt-10 mb-6 w-full pointer-events-none">
                            <Link
                                href="/search?sort=new&page=1"
                                className="bg-[#5b42f3] text-white font-bold px-10 py-3.5 rounded-full hover:bg-[#4b35d6] transition-all active:scale-95 pointer-events-auto"
                            >
                                Prikaži sve oglase
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* MOBILE TOP BAR */}
                        <div className="lg:hidden flex flex-col gap-4 mb-6">
                            <SearchBar
                                value={q}
                                onChange={setQ}
                                onSearch={handleSearch}
                                aiLink="/ai"
                            />

                            <div className="flex gap-2 w-full">
                                <div className="flex-1">
                                    <MobileFilters showFloating={true} categories={categories} initialFiltersData={initialFiltersData} initialUseFiltersData={initialUseFiltersData} />
                                </div>

                                <div ref={mobileSortRef} className="relative flex-1">
                                    <button
                                        type="button"
                                        onClick={() => setMobileSortOpen(o => !o)}
                                        className={`w-full h-11 bg-bg-2 border rounded-full px-4 text-left text-text-main text-sm font-bold focus:outline-none transition-all cursor-pointer flex items-center justify-between ${mobileSortOpen ? "border-[#6366f1]" : "border-bg-3"
                                            }`}
                                    >
                                        <span>
                                            {params["sort"] === "price_low" ? "Najjeftinije" : params["sort"] === "price_high" ? "Najskuplje" : "Najnovije"}
                                        </span>
                                        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${mobileSortOpen ? "rotate-180" : ""}`} />
                                    </button>

                                    <AnimatePresence>
                                        {mobileSortOpen && (
                                            <motion.ul
                                                initial={{ opacity: 0, y: -6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -6 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute z-50 mt-2 w-full bg-bg-2 border border-bg-3 rounded-3xl p-1.5 flex flex-col gap-1 shadow-xl"
                                            >
                                                {[
                                                    { value: "new", label: "Najnovije" },
                                                    { value: "price_low", label: "Najjeftinije" },
                                                    { value: "price_high", label: "Najskuplje" },
                                                ].map((opt) => (
                                                    <li
                                                        key={opt.value}
                                                        onClick={() => {
                                                            setSingle("sort", opt.value);
                                                            setMobileSortOpen(false);
                                                        }}
                                                        className={`px-4 py-2.5 rounded-2xl cursor-pointer text-sm transition-colors ${(params["sort"] || "new") === opt.value
                                                                ? "text-[#6366f1] font-semibold bg-[#6366f1]/10"
                                                                : "text-text-main hover:bg-bg-3"
                                                            }`}
                                                    >
                                                        {opt.label}
                                                    </li>
                                                ))}
                                            </motion.ul>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="flex overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
                                <div className="flex flex-nowrap gap-2">
                                    <ActiveTags />
                                </div>
                            </div>
                        </div>

                        {/* DESKTOP LAYOUT */}
                        <div className="flex flex-col lg:flex-row gap-10">
                            <aside className="hidden lg:block w-[300px] shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                                        Filteri
                                    </h2>
                                    <Filters categories={categories} initialFiltersData={initialFiltersData} initialUseFiltersData={initialUseFiltersData} />
                                </div>
                            </aside>

                            <div className="flex-1 min-w-0">
                                <div className="hidden lg:flex items-center gap-4 mb-8">
                                    <SearchBar
                                        value={q}
                                        onChange={setQ}
                                        onSearch={handleSearch}
                                        className="flex-1"
                                        aiLink="/ai"
                                    />

                                    <div ref={sortRef} className="relative w-[220px]">
                                        <button
                                            type="button"
                                            onClick={() => setSortOpen(o => !o)}
                                            className={`w-full h-11 bg-bg-2 border rounded-full px-6 text-left text-text-main font-bold focus:outline-none transition-all cursor-pointer text-sm flex items-center justify-between ${sortOpen ? "border-[#6366f1]" : "border-bg-3"
                                                }`}
                                        >
                                            <span>
                                                {params["sort"] === "price_low" ? "Najjeftinije" : params["sort"] === "price_high" ? "Najskuplje" : "Najnovije"}
                                            </span>
                                            <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`} />
                                        </button>

                                        <AnimatePresence>
                                            {sortOpen && (
                                                <motion.ul
                                                    initial={{ opacity: 0, y: -6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -6 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute z-50 mt-2 w-full bg-bg-2 border border-bg-3 rounded-3xl p-1.5 flex flex-col gap-1 shadow-xl"
                                                >
                                                    {[
                                                        { value: "new", label: "Najnovije" },
                                                        { value: "price_low", label: "Najjeftinije" },
                                                        { value: "price_high", label: "Najskuplje" },
                                                    ].map((opt) => (
                                                        <li
                                                            key={opt.value}
                                                            onClick={() => {
                                                                setSingle("sort", opt.value);
                                                                setSortOpen(false);
                                                            }}
                                                            className={`px-4 py-2.5 rounded-2xl cursor-pointer text-sm transition-colors ${(params["sort"] || "new") === opt.value
                                                                    ? "text-[#6366f1] font-semibold bg-[#6366f1]/10"
                                                                    : "text-text-main hover:bg-bg-3"
                                                                }`}
                                                        >
                                                            {opt.label}
                                                        </li>
                                                    ))}
                                                </motion.ul>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <AdsList
                                    columns={3}
                                    initialAds={initialAds}
                                    initialWishlistIds={wishlistIds}
                                    initialTotal={initialTotal}
                                    initialViewMode={initialViewMode}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
