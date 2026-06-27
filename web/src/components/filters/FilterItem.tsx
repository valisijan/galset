"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, ChevronDown } from "lucide-react";
import FilterModal from "./FilterModal";

interface FilterOption {
    name: string;
    slug: string;
}

interface FilterItemProps {
    filter: any;
    value: any;
    params?: any;
    onChange: (key: string, value: string | null) => void;
    onToggle: (key: string, value: string) => void;
    isJobs?: boolean;
}

// Separate component so useState works without hook-order issues
function RangeWithUnitFilter({ filter, params, onChange }: { filter: any; params: any; onChange: (key: string, value: string | null) => void }) {
    const resolvedUnits: any[] = filter.options?.units || filter.units || (filter.slug === "power" ? [
        { name: "kW", slug: "kw", factor: 1 },
        { name: "KS", slug: "ps", factor: 1.35962 }
    ] : []);
    const resolvedInputs = filter.options?.inputs || filter.inputs || { min: { name: "Od", slug: "min" }, max: { name: "Do", slug: "max" } };
    const resolvedDefaultUnit = filter.options?.default_unit || filter.default_unit || (filter.slug === "power" ? "kw" : resolvedUnits[0]?.slug || "");

    const minKey = `${filter.slug}_${resolvedInputs.min.slug}`;
    const maxKey = `${filter.slug}_${resolvedInputs.max.slug}`;

    // Unit is purely local UI state — NEVER stored in URL
    const [localUnit, setLocalUnit] = useState(resolvedDefaultUnit);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // URL always stores base unit (kW). Convert to display unit for input.
    const minKw = params?.[minKey] || "";
    const maxKw = params?.[maxKey] || "";

    const toDisplay = (kwVal: string) => {
        if (!kwVal) return "";
        if (localUnit === "ps") return Math.round(Number(kwVal) * 1.35962).toString();
        return kwVal;
    };

    // Local draft state for smooth typing (debounced URL update)
    const [localMin, setLocalMin] = useState(toDisplay(minKw));
    const [localMax, setLocalMax] = useState(toDisplay(maxKw));

    // Sync local state when URL params change externally (e.g. clear filters)
    useEffect(() => { setLocalMin(toDisplay(minKw)); }, [minKw, localUnit]);
    useEffect(() => { setLocalMax(toDisplay(maxKw)); }, [maxKw, localUnit]);

    // Handle clicking outside to close unit dropdown
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced commit to URL (avoid duplicate updates and mount-time loops)
    useEffect(() => {
        const targetKw = !localMin 
            ? "" 
            : (localUnit === "ps" ? Math.round(Number(localMin) / 1.35962).toString() : localMin);
        
        if (targetKw === minKw) return;

        const timer = setTimeout(() => {
            onChange(minKey, targetKw || null);
        }, 600);
        return () => clearTimeout(timer);
    }, [localMin, minKw, localUnit, minKey, onChange]);

    useEffect(() => {
        const targetKw = !localMax 
            ? "" 
            : (localUnit === "ps" ? Math.round(Number(localMax) / 1.35962).toString() : localMax);
        
        if (targetKw === maxKw) return;

        const timer = setTimeout(() => {
            onChange(maxKey, targetKw || null);
        }, 600);
        return () => clearTimeout(timer);
    }, [localMax, maxKw, localUnit, maxKey, onChange]);

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-400">{filter.name}</label>
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    placeholder={resolvedInputs.min.name || "Od"}
                    value={localMin}
                    onChange={(e) => setLocalMin(e.target.value)}
                    className="flex-1 min-w-0 h-10 bg-bg-2 border border-bg-3 rounded-full px-4 text-sm focus:border-[#6366f1] outline-none transition-colors"
                />
                <div className="w-1.5 h-px bg-gray-600 shrink-0" />
                <input
                    type="number"
                    placeholder={resolvedInputs.max.name || "Do"}
                    value={localMax}
                    onChange={(e) => setLocalMax(e.target.value)}
                    className="flex-1 min-w-0 h-10 bg-bg-2 border border-bg-3 rounded-full px-4 text-sm focus:border-[#6366f1] outline-none transition-colors"
                />
                {resolvedUnits.length > 1 && (
                    <div className="relative shrink-0 w-20" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(o => !o)}
                            className={`w-full h-10 bg-bg-2 border rounded-full px-3 text-center text-text-main font-bold focus:outline-none transition-all cursor-pointer text-xs flex items-center justify-between ${
                                isDropdownOpen ? "border-[#6366f1]" : "border-bg-3"
                            }`}
                        >
                            <span className="truncate">{resolvedUnits.find(u => u.slug === localUnit)?.name || localUnit.toUpperCase()}</span>
                            <ChevronDown size={12} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                            {isDropdownOpen && (
                                <motion.ul
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 z-50 mt-1 w-full bg-bg-2 border border-bg-3 rounded-2xl overflow-hidden shadow-xl"
                                >
                                    {resolvedUnits.map((u: any) => (
                                        <li
                                            key={u.slug}
                                            onClick={() => {
                                                setLocalUnit(u.slug);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`px-3 py-2 cursor-pointer text-center text-xs transition-colors ${
                                                localUnit === u.slug
                                                    ? "text-[#6366f1] font-semibold bg-[#6366f1]/10"
                                                    : "text-text-main hover:bg-bg-3"
                                            }`}
                                        >
                                            {u.name}
                                        </li>
                                    ))}
                                </motion.ul>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}

// Separate component for range filters so useState/useEffect work without hook-order issues
function RangeFilter({ filter, params, onChange, isJobs }: { filter: any; params: any; onChange: (key: string, value: string | null) => void; isJobs?: boolean }) {
    const resolvedInputs = filter.options?.inputs || filter.inputs || { min: { name: "Od", slug: "min" }, max: { name: "Do", slug: "max" } };
    const minKey = `${filter.slug}_${resolvedInputs.min.slug || "min"}`;
    const maxKey = `${filter.slug}_${resolvedInputs.max.slug || "max"}`;

    const [localMin, setLocalMin] = useState(params?.[minKey] || "");
    const [localMax, setLocalMax] = useState(params?.[maxKey] || "");

    // Sync when URL params change externally (e.g. clear filters)
    useEffect(() => { setLocalMin(params?.[minKey] || ""); }, [params?.[minKey]]);
    useEffect(() => { setLocalMax(params?.[maxKey] || ""); }, [params?.[maxKey]]);

    // Debounced commit to URL — only run when values differ from URL
    useEffect(() => {
        const currentVal = params?.[minKey] || "";
        if (localMin === currentVal) return;

        const timer = setTimeout(() => onChange(minKey, localMin || null), 600);
        return () => clearTimeout(timer);
    }, [localMin, params?.[minKey], minKey, onChange]);

    useEffect(() => {
        const currentVal = params?.[maxKey] || "";
        if (localMax === currentVal) return;

        const timer = setTimeout(() => onChange(maxKey, localMax || null), 600);
        return () => clearTimeout(timer);
    }, [localMax, params?.[maxKey], maxKey, onChange]);

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-400">{filter.name}</label>
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    placeholder={resolvedInputs.min.name || "Od"}
                    value={localMin}
                    onChange={(e) => setLocalMin(e.target.value)}
                    className="w-full h-10 bg-bg-2 border border-bg-3 rounded-full px-4 text-sm focus:border-[#6366f1] outline-none transition-colors"
                />
                <div className="w-2 h-px bg-gray-600" />
                <input
                    type="number"
                    placeholder={resolvedInputs.max.name || "Do"}
                    value={localMax}
                    onChange={(e) => setLocalMax(e.target.value)}
                    className="w-full h-10 bg-bg-2 border border-bg-3 rounded-full px-4 text-sm focus:border-[#6366f1] outline-none transition-colors"
                />
            </div>
            {filter.slug === "price" && (
                <div className="flex flex-col gap-1.5 mt-2">
                    {!isJobs && (
                        <div
                            onClick={() => onChange("isFree", params?.isFree === "true" ? null : "true")}
                            className="flex items-center justify-between p-2.5 -mx-2.5 px-4 rounded-full hover:bg-bg-2 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${params?.isFree === "true" ? "bg-[#5b42f3] hover:bg-[#4b35d6] border-[#6366f1]" : "bg-transparent border-bg-2 group-hover:border-[#6366f1] group-hover:bg-bg-3/20"}`}>
                                    {params?.isFree === "true" && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                            <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                                        </motion.div>
                                    )}
                                </div>
                                <span className={`text-sm tracking-tight transition-colors ${params?.isFree === "true" ? "text-text-main font-semibold" : "text-gray-400"}`}>
                                    Poklanjam
                                </span>
                            </div>
                        </div>
                    )}
                    <div
                        onClick={() => onChange("isContact", params?.isContact === "true" ? null : "true")}
                        className="flex items-center justify-between p-2.5 -mx-2.5 px-4 rounded-full hover:bg-bg-2 transition-colors cursor-pointer group"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${params?.isContact === "true" ? "bg-[#5b42f3] hover:bg-[#4b35d6] border-[#6366f1]" : "bg-transparent border-bg-2 group-hover:border-[#6366f1] group-hover:bg-bg-3/20"}`}>
                                {params?.isContact === "true" && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                                    </motion.div>
                                )}
                            </div>
                            <span className={`text-sm tracking-tight transition-colors ${params?.isContact === "true" ? "text-text-main font-semibold" : "text-gray-400"}`}>
                                {isJobs ? "Plata na upit" : "Cena na upit"}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function FilterItem({ filter, value, params, onChange, onToggle, isJobs }: FilterItemProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (filter.type === "text" && filter.slug !== "q") {
        return (
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-400">{filter.name}</label>
                <input
                    type="text"
                    value={value || ""}
                    onChange={(e) => onChange(filter.slug, e.target.value)}
                    className="w-full h-10 bg-bg-2 border border-bg-3 rounded-xl px-4 text-sm focus:border-[#6366f1] outline-none transition-colors"
                    placeholder={filter.name}
                />
            </div>
        );
    }

    if (filter.type === "range") {
        return <RangeFilter filter={filter} params={params} onChange={onChange} isJobs={isJobs} />;
    }

    if (filter.type === "range-with-unit") {
        return <RangeWithUnitFilter filter={filter} params={params} onChange={onChange} />;
    }

    if (filter.type === "checkbox-multi") {
        const options = filter.options || [];
        const isLarge = options.length > 10;
        const selectedValues = value ? String(value).split(",") : [];
        const selectedBrands = params["brand"] ? String(params["brand"]).split(",") : [];

        if (isLarge) {
            const selectedNames = options
                .filter((o: FilterOption) => selectedValues.includes(o.slug))
                .map((o: FilterOption) => o.name);

            let displayText = "Izaberi";
            if (selectedNames.length > 0) {
                displayText = selectedNames.join(", ");
                if (displayText.length > 35) {
                    displayText = displayText.substring(0, 32) + "...";
                }
            }

            return (
                <>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-400">{filter.name}</label>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full h-11 bg-bg-2 border border-bg-3 rounded-full px-5 flex items-center justify-between hover:border-[#6366f1] transition-all group active:scale-[0.98] cursor-pointer"
                        >
                            <span className={`text-sm tracking-tight truncate pr-4 ${selectedNames.length > 0 ? "text-text-main font-medium" : "text-gray-500"}`}>
                                {displayText}
                            </span>
                            <div className="w-6 h-6 rounded-full bg-bg-3 flex items-center justify-center group-hover:bg-[#5b42f3] transition-colors">
                                <Plus size={14} className="text-white" />
                            </div>
                        </button>
                    </div>

                    <FilterModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        title={filter.name}
                        options={options}
                        selectedValues={selectedValues}
                        onToggle={(slug) => onToggle(filter.slug, slug)}
                        onClear={() => onChange(filter.slug, null)}
                    />
                </>
            );
        }

        return (
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-400">{filter.name}</label>
                <div className="flex flex-col gap-1.5">
                    {options.map((opt: FilterOption) => {
                        const isChecked = selectedValues.includes(opt.slug);
                        return (
                            <div
                                key={opt.slug}
                                onClick={() => onToggle(filter.slug, opt.slug)}
                                className="flex items-center justify-between p-2.5 -mx-2.5 px-4 rounded-full hover:bg-bg-2 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isChecked ? "bg-[#5b42f3] hover:bg-[#4b35d6] border-[#6366f1]" : "bg-transparent border-bg-2 group-hover:border-[#6366f1] group-hover:bg-bg-3/20"}`}
                                    >
                                        {isChecked && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                            >
                                                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                                            </motion.div>
                                        )}
                                    </div>
                                    <span className={`text-sm tracking-tight transition-colors ${isChecked ? "text-text-main font-semibold" : "text-gray-400"}`}>
                                        {opt.name}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (filter.type === "radio") {
        const options = filter.options || [];
        const selectedValue = value ? String(value) : null;

        return (
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-400">{filter.name}</label>
                <div className="flex flex-col gap-1.5">
                    {options.map((opt: FilterOption) => {
                        const isChecked = selectedValue === opt.slug;
                        return (
                            <div
                                key={opt.slug}
                                onClick={() => onChange(filter.slug, isChecked ? null : opt.slug)}
                                className="flex items-center justify-between p-2.5 -mx-2.5 px-4 rounded-full hover:bg-bg-2 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isChecked ? "bg-[#5b42f3] hover:bg-[#4b35d6] border-[#6366f1]" : "bg-transparent border-bg-2 group-hover:border-[#6366f1] group-hover:bg-bg-3/20"}`}
                                    >
                                        {isChecked && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-2.5 h-2.5 bg-white rounded-full"
                                            />
                                        )}
                                    </div>
                                    <span className={`text-sm tracking-tight transition-colors ${isChecked ? "text-text-main font-semibold" : "text-gray-400"}`}>
                                        {opt.name}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return null;
}
