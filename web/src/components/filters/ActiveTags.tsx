"use client";

import { useFilters } from "./useFilters";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function ActiveTags() {
    const { activeTags, removeTag, params } = useFilters();
    const pathname = usePathname();
    const [filtersData, setFiltersData] = useState<any[]>([]);

    const isJobs = pathname?.split("/").includes("jobs") || params["category"]?.split("/").includes("jobs");

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/data/filters-data.json`)
            .then(res => res.json())
            .then(data => setFiltersData(Array.isArray(data) ? data : []))
            .catch(err => {
                console.error("Failed to load filters data:", err);
                setFiltersData([]);
            });
    }, []);

    if (activeTags.length === 0) return null;

    // Grouping and processing tags
    const processedTags: any[] = [];
    const usedKeys = new Set<string>();

    const unitSuffixes: Record<string, string> = {
        price: " €",
        power: " kW",
        mileage: " km",
        "engine-size": " cm³",
        area: " m²",
        land: " a",
        salary: " €",
    };

    // First find all range filters from definitions and process them
    const rangeFilters = filtersData.filter((f: any) => f.type === "range" || f.type === "range-with-unit");

    rangeFilters.forEach((filter: any) => {
        const minKey = `${filter.slug}_min`;
        const maxKey = `${filter.slug}_max`;

        const minTag = activeTags.find(t => t.key === minKey);
        const maxTag = activeTags.find(t => t.key === maxKey);

        if (minTag || maxTag) {
            const minVal = minTag?.value;
            const maxVal = maxTag?.value;
            let suffix = unitSuffixes[filter.slug] || "";
            if (filter.slug === "price" && isJobs) {
                suffix = " € / mes.";
            }

            let valueLabel = "";
            if (minVal && maxVal) {
                valueLabel = `${minVal} - ${maxVal}${suffix}`;
            } else if (minVal) {
                valueLabel = `Od ${minVal}${suffix}`;
            } else if (maxVal) {
                valueLabel = `Do ${maxVal}${suffix}`;
            }

            const filterName = (filter.slug === "price" && isJobs) ? "Plata" : filter.name;

            processedTags.push({
                key: `${filter.slug}_range`,
                label: `${filterName}: ${valueLabel}`,
                originalKeys: [minTag ? minKey : null, maxTag ? maxKey : null].filter(Boolean)
            });

            usedKeys.add(minKey);
            usedKeys.add(maxKey);
        }
    });

    // Handle special check-boxes like isFree and isContact which are related to price, and default checkboxes/radios
    activeTags.forEach((tag: any) => {
        if (usedKeys.has(tag.key)) return;

        if (tag.key === "isFree") {
            processedTags.push({ key: tag.key, label: "Poklanjam", value: tag.value });
            usedKeys.add(tag.key);
        } else if (tag.key === "isContact") {
            processedTags.push({ key: tag.key, label: isJobs ? "Plata na upit" : "Cena na upit", value: tag.value });
            usedKeys.add(tag.key);
        } else {
            const filter = filtersData.find(f => f.slug === tag.key);
            let valueLabel = tag.value;

            if (filter && filter.options) {
                const option = filter.options.find((o: any) => o.slug === tag.value);
                if (option) valueLabel = option.name;
            }

            if (typeof valueLabel === "string") {
                valueLabel = valueLabel.replace(/-/g, " ");
            }

            processedTags.push({ key: tag.key, label: valueLabel, value: tag.value });
        }
    });

    return (
        <>
            {processedTags.map((tag: any) => (
                <button
                    key={tag.key + (tag.value || "")}
                    onClick={() => {
                        if (tag.originalKeys) {
                            tag.originalKeys.forEach((k: string) => removeTag(k, ""));
                        } else {
                            removeTag(tag.key, tag.value);
                        }
                    }}
                    className="flex items-center h-8 px-3 bg-bg-2 border border-bg-3 rounded-full text-sm hover:border-gray-400 dark:hover:border-[#555] hover:bg-bg-3 transition-all group shrink-0 cursor-pointer"
                >
                    <span className="text-text-main mr-2 whitespace-nowrap capitalize">{tag.label}</span>
                    <div className="w-4 h-4 rounded-full bg-bg-3 flex items-center justify-center group-hover:bg-bg-4 transition-colors">
                        <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                            <path d="M9 1L1 9M1 1L9 9" stroke="currentColor" className="text-gray-500 dark:text-gray-400 group-hover:text-text-main transition-colors" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </div>
                </button>
            ))}
        </>
    );
}
