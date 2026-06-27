"use client";

import { useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Category {
    id: number;
    name: string;
    slug?: string;
    subslug?: string;
    childslug?: string;
    subcategories?: Category[];
}

// Walk the category tree using full path segments to find the current category and parent
function findCategoryByPath(cats: Category[], pathSegs: string[]): {
    current: Category | null;
    parent: Category | null;
} {
    let current: Category | null = null;
    let parent: Category | null = null;
    let currentLevelCats = cats;

    for (let i = 0; i < pathSegs.length; i++) {
        const seg = pathSegs[i];
        const found = currentLevelCats.find(cat => {
            const slug = cat.slug || cat.subslug || cat.childslug;
            return slug === seg;
        });

        if (!found) {
            return { current: null, parent: null };
        }

        parent = current;
        current = found;
        currentLevelCats = found.subcategories || [];
    }

    return { current, parent };
}

export default function CategoryNavigator({
    categories,
    currentCategorySlug: externalSlug,
    onNavigate: externalOnNavigate
}: {
    categories: Category[];
    currentCategorySlug?: string;
    onNavigate?: (slug: string | null) => void;
}) {
    const router = useRouter();
    const pathname = usePathname();

    // Determine the current path segments
    const pathSegs = useMemo(() => {
        if (externalSlug !== undefined) {
            return externalSlug ? externalSlug.split('/').filter(Boolean) : [];
        }
        const segs = (pathname || "").split('/').filter(Boolean);
        if (segs[0] === 'search' && segs.length > 1) {
            return segs.slice(1);
        }
        return [];
    }, [externalSlug, pathname]);

    const currentSlug = pathSegs[pathSegs.length - 1];

    const { currentCategory, parentCategory, levelItems } = useMemo(() => {
        const { current, parent } = findCategoryByPath(categories, pathSegs);

        let items: Category[] = [];
        if (pathSegs.length === 0) {
            items = categories;
        } else if (current && current.subcategories && current.subcategories.length > 0) {
            items = current.subcategories;
        } else {
            items = [];
        }

        return { currentCategory: current, parentCategory: parent, levelItems: items };
    }, [categories, pathSegs]);

    const handleNavigate = (cat: Category) => {
        const slug = cat.slug || cat.subslug || cat.childslug;
        if (!slug) return;

        const newPathSegs = [...pathSegs, slug];
        const newPathStr = newPathSegs.join('/');

        if (externalOnNavigate) {
            externalOnNavigate(newPathStr);
        } else {
            const currentParams = new URLSearchParams(window.location.search);
            const qs = currentParams.toString();
            router.push(`/search/${newPathStr}${qs ? `?${qs}` : ''}`);
        }
    };

    const handleBack = () => {
        const newPathSegs = pathSegs.slice(0, -1);
        const newPathStr = newPathSegs.join('/');

        if (externalOnNavigate) {
            externalOnNavigate(newPathSegs.length > 0 ? newPathStr : null);
        } else {
            const currentParams = new URLSearchParams(window.location.search);
            const qs = currentParams.toString();
            if (newPathSegs.length > 0) {
                router.push(`/search/${newPathStr}${qs ? `?${qs}` : ''}`);
            } else {
                router.push(`/search${qs ? `?${qs}` : ''}`);
            }
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-gray-500 tracking-wider">Kategorije</h3>
            <div className="border border-bg-3 rounded-3xl bg-bg-2 p-1.5 flex flex-col gap-1">
                {currentSlug && (
                    <>
                        <button
                            onClick={handleBack}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl hover:bg-bg-3 transition-all group cursor-pointer text-left"
                        >
                            <ChevronLeft 
                                size={16} 
                                className="text-gray-400 group-hover:text-text-main transition-colors" 
                            />
                            <span className="text-sm font-bold text-gray-400 group-hover:text-text-main transition-colors">Nazad</span>
                        </button>
                        <div className="h-px bg-bg-3 my-0.5 mx-2" />
                    </>
                )}

                <div className="flex flex-col gap-1">
                    {levelItems.map((cat) => {
                        const slug = cat.slug || cat.subslug || cat.childslug;
                        const isActive = slug === currentSlug;

                        return (
                            <button
                                key={slug || cat.name}
                                onClick={() => handleNavigate(cat)}
                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl hover:bg-bg-3 transition-all cursor-pointer ${isActive ? "bg-bg-3" : ""}`}
                            >
                                <span className={`text-sm ${isActive ? "text-[#6366f1] font-bold" : "text-text-main"} transition-colors`}>
                                    {cat.name}
                                </span>
                                {cat.subcategories && cat.subcategories.length > 0 && (
                                    <ChevronRight size={16} className="text-text-main opacity-20 dark:opacity-40 shrink-0" />
                                )}
                            </button>
                        );
                    })}

                    {currentSlug && levelItems.length === 0 && currentCategory && (
                        <div className="px-4 py-3 bg-[#6366f1]/10 rounded-2xl">
                            <span className="text-sm font-bold text-[#6366f1]">
                                {(currentCategory as Category).name}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
