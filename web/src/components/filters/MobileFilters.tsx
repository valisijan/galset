"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Filters from "./Filters";
import { motion, AnimatePresence } from "framer-motion";
import { X, Filter } from "lucide-react";
import { useFilters } from "./useFilters";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function MobileFilters({
    categoryId,
    categories,
    className = "",
    showTrigger = true,
    showFloating = false,
    initialFiltersData,
    initialUseFiltersData,
}: {
    categoryId?: number;
    categories?: any[];
    className?: string;
    showTrigger?: boolean;
    showFloating?: boolean;
    initialFiltersData?: any[];
    initialUseFiltersData?: any;
}) {
    const { params } = useFilters();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const isOpen = searchParams?.get("filter_modal") === "true";
    const [mounted, setMounted] = useState(false);

    // Keep track of the URL when the modal was opened to discard changes on cancel
    const initialUrlRef = useRef<{ pathname: string; search: string } | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (!initialUrlRef.current) {
                const searchParamsBefore = new URLSearchParams(window.location.search);
                searchParamsBefore.delete("filter_modal");
                initialUrlRef.current = {
                    pathname: window.location.pathname,
                    search: searchParamsBefore.toString()
                };
            }
        } else {
            initialUrlRef.current = null;
        }
    }, [isOpen]);

    // Get category full path from current URL pathname (/search/vehicles/cars → "vehicles/cars")
    const getPathCategory = useCallback(() => {
        const segs = (pathname || "").split('/').filter(Boolean);
        if (segs[0] === 'search' && segs.length > 1) {
            return segs.slice(1).join('/');
        }
        return "";
    }, [pathname]);

    // Draft state for manual apply
    const [draftParams, setDraftParams] = useState<Record<string, string>>({});

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Sync draftParams with active params when modal opens or active category changes
    const currentUrlCategory = getPathCategory();
    useEffect(() => {
        if (isOpen) {
            setDraftParams(prev => {
                const next = { ...prev };
                Object.keys(params).forEach(key => {
                    if (key !== "filter_modal") {
                        next[key] = params[key];
                    }
                });
                Object.keys(next).forEach(key => {
                    if ((!params.hasOwnProperty(key) && key !== "category") || key === "filter_modal") {
                        delete next[key];
                    }
                });
                next.category = currentUrlCategory;
                return next;
            });
        }
    }, [isOpen, params, currentUrlCategory]);

    const handleOpen = useCallback(() => {
        const currentParams = new URLSearchParams(window.location.search);
        currentParams.set("filter_modal", "true");
        router.push(`${pathname}?${currentParams.toString()}`, { scroll: false });
    }, [pathname, router]);

    const handleClose = useCallback(() => {
        if (initialUrlRef.current) {
            const { pathname: initPath, search: initSearch } = initialUrlRef.current;
            router.replace(`${initPath}${initSearch ? `?${initSearch}` : ""}`, { scroll: false });
        } else {
            const currentParams = new URLSearchParams(window.location.search);
            currentParams.delete("filter_modal");
            const qs = currentParams.toString();
            router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
        }
    }, [pathname, router]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            document.documentElement.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
        };
    }, [isOpen]);

    const onDraftChange = (key: string, value: string | null) => {
        if (key === "category") {
            const nextParams = new URLSearchParams(window.location.search);
            nextParams.set("filter_modal", "true");
            nextParams.set("page", "1");
            const categoryPath = value || "";
            const basePath = categoryPath ? `/search/${categoryPath}` : "/search";
            // Use replace instead of push to avoid accumulating history inside the modal
            router.replace(`${basePath}?${nextParams.toString()}`, { scroll: false });
            return;
        }

        setDraftParams(prev => {
            const next = { ...prev };
            if (value === null || value === "") {
                delete next[key];
            } else {
                next[key] = value;
            }
            if (key !== "page") {
                next["page"] = "1";
            }
            return next;
        });
    };

    const onDraftToggle = (key: string, value: string) => {
        const currentVal = draftParams[key] || "";
        const values = currentVal ? currentVal.split(",") : [];

        let nextValues;
        if (values.includes(value)) {
            nextValues = values.filter(v => v !== value);
        } else {
            nextValues = [...values, value];
        }

        const nextValString = nextValues.join(",");
        onDraftChange(key, nextValString || null);
    };

    const applyFilters = () => {
        const nextParams = new URLSearchParams();

        if (draftParams.q) nextParams.set('q', draftParams.q);

        Object.keys(draftParams).forEach(key => {
            if (key !== 'q' && key !== 'sort' && key !== 'page' && key !== 'category' && key !== 'filter_modal') {
                nextParams.set(key, draftParams[key]);
            }
        });

        nextParams.set('sort', draftParams.sort || 'new');
        nextParams.set('page', '1');

        const categoryPath = draftParams.category;
        const basePath = categoryPath ? `/search/${categoryPath}` : "/search";
        const finalUrl = `${basePath}?${nextParams.toString()}`;

        router.replace(finalUrl, { scroll: false });
    };

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="fixed inset-0 z-[9999] bg-bg-1 flex flex-col rounded-none overflow-hidden"
                >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-bg-3 bg-bg-1">
                        <h2 className="text-xl font-bold text-text-main">Filteri</h2>
                        <button
                            onClick={handleClose}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-3 hover:bg-bg-4 transition-colors cursor-pointer"
                        >
                            <X size={20} className="text-text-main" />
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="flex-1 overflow-y-auto px-6 pt-8 pb-32 custom-modal-scrollbar">
                        <Filters
                            categoryId={categoryId}
                            categories={categories}
                            externalParams={draftParams}
                            onChange={onDraftChange}
                            onToggle={onDraftToggle}
                            initialFiltersData={initialFiltersData}
                            initialUseFiltersData={initialUseFiltersData}
                        />
                    </div>

                    {/* Modal Footer */}
                    <div className="absolute bottom-0 left-0 right-0 z-[999] p-6 bg-transparent flex justify-center w-full pointer-events-none">
                        <button
                            onClick={applyFilters}
                            className="w-full max-w-[280px] h-12 bg-[#5b42f3] hover:bg-[#4b35d6] rounded-full text-white font-bold text-base active:scale-[0.98] transition-all shadow-none pointer-events-auto cursor-pointer"
                        >
                            Prikaži rezultate
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            {showTrigger && (
                <button
                    onClick={handleOpen}
                    className={`w-full h-11 bg-[#5b42f3] hover:bg-[#4b35d6] text-white rounded-full flex items-center justify-center active:scale-95 transition-all cursor-pointer ${className}`}
                >
                    <span className="text-sm font-bold">Filteri</span>
                </button>
            )}

            {showFloating && (
                <div className="lg:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-[180] pointer-events-none">
                    <button
                        onClick={handleOpen}
                        className="px-10 h-11 bg-[#5b42f3] hover:bg-[#4b35d6] rounded-full text-white font-bold text-sm flex items-center justify-center pointer-events-auto active:scale-95 transition-all cursor-pointer"
                    >
                        <span>Filteri</span>
                    </button>
                </div>
            )}

            {mounted && createPortal(modalContent, document.body)}
        </>
    );
}
