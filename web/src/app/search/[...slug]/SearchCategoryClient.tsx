"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Filters from "@/components/filters/Filters";
import MobileFilters from "@/components/filters/MobileFilters";
import ActiveTags from "@/components/filters/ActiveTags";
import AdsList from "@/components/ads/AdsList";
import { useFilters } from "@/components/filters/useFilters";
import SearchBar from "@/components/SearchBar";

interface SearchCategoryClientProps {
    initialAds: any[];
    initialWishlistIds: number[];
    initialTotal: number;
    categoryId: number | undefined;
    user: any;
    currentSlug: string;
    initialViewMode?: 'grid' | 'list';
    categories?: any[];
    initialFiltersData?: any[];
    initialUseFiltersData?: any;
}

export default function SearchCategoryClient({
    initialAds,
    initialWishlistIds,
    initialTotal,
    categoryId,
    user,
    currentSlug,
    initialViewMode = 'grid',
    categories = [],
    initialFiltersData,
    initialUseFiltersData,
}: SearchCategoryClientProps) {
    const { params, setSingle } = useFilters();
    const [q, setQ] = useState(params["q"] || "");
    const [sortOpen, setSortOpen] = useState(false);
    const [mobileSortOpen, setMobileSortOpen] = useState(false);

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

    return (
        <div className="w-full min-h-screen bg-bg-1 text-text-main">
            <div className="w-full max-w-[1300px] mx-auto px-4 md:px-6 py-6">
                {/* MOBILE TOP BAR */}
                <div className="lg:hidden flex flex-col gap-4 mb-6">
                    <SearchBar value={q} onChange={setQ} onSearch={handleSearch} aiLink="/ai" />

                    <div className="flex gap-2 w-full">
                        <div className="flex-1">
                            <MobileFilters categoryId={categoryId} showFloating={true} categories={categories} initialFiltersData={initialFiltersData} initialUseFiltersData={initialUseFiltersData} />
                        </div>

                        <div ref={mobileSortRef} className="relative flex-1">
                            <button
                                type="button"
                                onClick={() => setMobileSortOpen(o => !o)}
                                className={`w-full h-11 bg-bg-2 border rounded-full px-4 text-left text-text-main text-sm font-bold focus:outline-none transition-all cursor-pointer flex items-center justify-between ${
                                    mobileSortOpen ? "border-[#6366f1]" : "border-bg-3"
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
                                                className={`px-4 py-2.5 rounded-2xl cursor-pointer text-sm transition-colors ${
                                                    (params["sort"] || "new") === opt.value
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

                    {/* MOBILE ACTIVE TAGS - horizontally scrollable */}
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
                            <h2 className="text-xl font-bold mb-8 flex items-center gap-3">Filteri</h2>
                            <Filters categoryId={categoryId} categories={categories} initialFiltersData={initialFiltersData} initialUseFiltersData={initialUseFiltersData} />
                        </div>
                    </aside>

                    <div className="flex-1 min-w-0">
                        {/* DESKTOP TOP BAR */}
                        <div className="hidden lg:flex items-center gap-4 mb-8">
                            <SearchBar value={q} onChange={setQ} onSearch={handleSearch} className="flex-1" aiLink="/ai" />

                            <div ref={sortRef} className="relative w-[220px]">
                                <button
                                    type="button"
                                    onClick={() => setSortOpen(o => !o)}
                                    className={`w-full h-11 bg-bg-2 border rounded-full px-6 text-left text-text-main font-bold focus:outline-none transition-all cursor-pointer text-sm flex items-center justify-between ${
                                        sortOpen ? "border-[#6366f1]" : "border-bg-3"
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
                                                    className={`px-4 py-2.5 rounded-2xl cursor-pointer text-sm transition-colors ${
                                                        (params["sort"] || "new") === opt.value
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
                            categoryId={categoryId} 
                            columns={3} 
                            initialAds={initialAds} 
                            initialWishlistIds={initialWishlistIds} 
                            initialTotal={initialTotal}
                            initialViewMode={initialViewMode}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
