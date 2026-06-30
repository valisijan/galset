"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Check } from "lucide-react";

interface FilterOption {
    name: string;
    slug: string;
}

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    options: FilterOption[];
    selectedValues: string[];
    onToggle: (slug: string) => void;
    onClear: () => void;
}

export default function FilterModal({
    isOpen,
    onClose,
    title,
    options,
    selectedValues,
    onToggle,
    onClear,
}: FilterModalProps) {
    const [search, setSearch] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            const originalOverflow = document.body.style.overflow;
            document.documentElement.style.overflow = "hidden";
            document.body.style.overflow = "hidden";

            window.history.pushState({ modal: "filter" }, "");
            const handlePopstate = (e: PopStateEvent) => {
                if (e.state?.modal !== "filter") {
                    onClose();
                }
            };
            window.addEventListener("popstate", handlePopstate);

            return () => {
                if (!window.history.state?.modalOpen) {
                    document.documentElement.style.overflow = "unset";
                    document.body.style.overflow = "unset";
                }

                window.removeEventListener("popstate", handlePopstate);
                if (window.history.state?.modal === "filter") {
                    window.history.back();
                }
            };
        }
    }, [isOpen, onClose]);

    const filteredOptions = useMemo(() => {
        return options.filter((opt) =>
            opt.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [options, search]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-[400px] max-h-[80vh] bg-bg-2 rounded-3xl z-[1010] shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="pt-8 pb-4 px-6 text-center flex flex-col gap-4 shrink-0">
                            <h3 className="text-text-main font-bold text-lg">{title}</h3>
                            {options.length > 10 && (
                                <div className="relative w-full">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Pretraži..."
                                        className="w-full h-11 bg-bg-3/50 border border-bg-3 rounded-full pl-11 pr-4 text-text-main text-sm focus:border-[#6366f1] outline-none transition-all placeholder-gray-500"
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40">
                                        <Search size={16} className="text-text-main" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Options List */}
                        <div className="flex-1 overflow-y-auto px-6 py-2 pb-6 custom-modal-scrollbar flex flex-col items-start gap-1.5 w-full">
                            {filteredOptions.map((opt) => {
                                const isChecked = selectedValues.includes(opt.slug);
                                return (
                                    <div
                                        key={opt.slug}
                                        onClick={() => onToggle(opt.slug)}
                                        className="flex items-center gap-3 w-full py-2.5 px-4 rounded-full cursor-pointer hover:bg-bg-3/40 transition-colors group justify-start"
                                    >
                                        <div
                                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${isChecked
                                                ? "bg-[#5b42f3] hover:bg-[#4b35d6] border-[#6366f1]"
                                                : "bg-transparent border-bg-3 group-hover:border-[#6366f1]"
                                                }`}
                                        >
                                            {isChecked && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                                        </div>
                                        <span className={`text-sm tracking-tight transition-colors truncate ${isChecked ? "text-text-main font-semibold" : "text-gray-400 group-hover:text-text-main"}`}>
                                            {opt.name}
                                        </span>
                                    </div>
                                );
                            })}

                            {filteredOptions.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-8 w-full text-gray-500 italic text-sm">
                                    Nema rezultata za "{search}"
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="w-full px-6 pb-6 pt-2 flex flex-col gap-2 shrink-0">
                            {selectedValues.length > 0 && (
                                <button
                                    onClick={onClear}
                                    className="w-full py-2 text-center text-sm font-bold text-[#6366f1] hover:text-[#5053e3] transition-colors cursor-pointer"
                                >
                                    Poništi sve
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="w-full py-3 rounded-full bg-[#5b42f3] hover:bg-[#4b35d6] text-white font-bold transition-all duration-200 cursor-pointer text-base"
                            >
                                Primeni
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
