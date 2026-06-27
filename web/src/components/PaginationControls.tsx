"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Grip, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PaginationControlsProps {
    page: number;
    setPage: (page: number) => void;
    adsPerPage: number;
    onAdsPerPageChange: (val: number) => void;
    totalAds: number;
    hasMore: boolean;
    loading: boolean;
    showViewMode?: boolean;
    viewMode?: 'grid' | 'list';
    onViewModeToggle?: () => void;
}

export default function PaginationControls({
    page,
    setPage,
    adsPerPage,
    onAdsPerPageChange,
    totalAds,
    hasMore,
    loading,
    showViewMode = false,
    viewMode = 'grid',
    onViewModeToggle
}: PaginationControlsProps) {
    const [isAdsPerPageOpen, setIsAdsPerPageOpen] = useState(false);
    const adsPerPageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (adsPerPageRef.current && !adsPerPageRef.current.contains(event.target as Node)) {
                setIsAdsPerPageOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const GridIcon = () => (
        <div className="grid grid-cols-3 gap-[2.5px] w-[18px]">
            {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="w-[4px] h-[4px] bg-current rounded-[1px]" />
            ))}
        </div>
    );

    const MobileGridIcon = () => (
        <Grip size={20} className="opacity-70" />
    );

    if (loading || totalAds === 0) return null;

    return (
        <div className="w-full flex flex-col mt-8 gap-4">
            {/* Pagination Navigation */}
            <div className="flex justify-between items-center w-full">
                <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className={`flex items-center gap-2 px-5 py-2.5 bg-bg-2 border border-bg-3 text-text-main rounded-full font-medium transition ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-bg-3 hover:border-bg-4 cursor-pointer'}`}
                >
                    <ChevronLeft className="w-4 h-4 opacity-70" />
                    Nazad
                </button>
                <span className="text-gray-400 font-medium">
                    Strana {page}
                </span>
                <button
                    onClick={() => setPage(page + 1)}
                    disabled={!hasMore || (page * adsPerPage >= totalAds)}
                    className={`flex items-center gap-2 px-5 py-2.5 bg-bg-2 border border-bg-3 text-text-main rounded-full font-medium transition ${(!hasMore || (page * adsPerPage >= totalAds)) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-bg-3 hover:border-bg-4 cursor-pointer'}`}
                >
                    Dalje
                    <ChevronRight className="w-4 h-4 opacity-70" />
                </button>
            </div>

            {/* Pagination Limit and View Layout Toggle */}
            <div className="w-full flex flex-col sm:flex-row justify-center sm:justify-end items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="relative w-[225px]" ref={adsPerPageRef}>
                        <button
                            onClick={() => setIsAdsPerPageOpen(!isAdsPerPageOpen)}
                            className={`w-full h-11 bg-bg-2 border rounded-full px-6 text-left text-text-main font-bold focus:outline-none transition-all cursor-pointer text-sm flex items-center justify-between ${
                                isAdsPerPageOpen ? "border-[#6366f1]" : "border-bg-3"
                            }`}
                        >
                            <span>Oglasi po stranici: {adsPerPage}</span>
                            <ChevronDown
                                size={16}
                                className={`text-gray-400 transition-transform duration-300 ${isAdsPerPageOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        <AnimatePresence>
                            {isAdsPerPageOpen && (
                                <motion.ul
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute z-50 mt-2 w-full bg-bg-2 border border-bg-3 rounded-3xl p-1.5 flex flex-col gap-1 shadow-xl"
                                >
                                    {[30, 60, 90].map((val) => (
                                        <li
                                            key={val}
                                            onClick={() => {
                                                onAdsPerPageChange(val);
                                                setIsAdsPerPageOpen(false);
                                            }}
                                            className={`px-4 py-2.5 rounded-2xl cursor-pointer text-sm transition-colors ${
                                                adsPerPage === val
                                                    ? "text-[#6366f1] font-semibold bg-[#6366f1]/10"
                                                    : "text-text-main hover:bg-bg-3"
                                            }`}
                                        >
                                            Oglasi po stranici: {val}
                                        </li>
                                    ))}
                                </motion.ul>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {showViewMode && onViewModeToggle && (
                    <button
                        onClick={onViewModeToggle}
                        className="h-11 px-6 flex items-center gap-3 rounded-full bg-bg-2 border border-bg-3 hover:border-[#6366f1] transition-all cursor-pointer text-text-main font-bold text-sm"
                    >
                        <span>Prikaz oglasa</span>
                        {viewMode === 'list' ? (
                            <>
                                <div className="hidden lg:block"><GridIcon /></div>
                                <div className="lg:hidden"><MobileGridIcon /></div>
                            </>
                        ) : (
                            <List size={22} className="opacity-70 group-hover:opacity-100 transition-opacity text-gray-400" />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
