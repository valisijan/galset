"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Search, Sparkles } from "lucide-react";
import SearchBar from "@/components/SearchBar";

interface Category {
    id: number;
    name: string;
    slug?: string;
    subslug?: string;
    childslug?: string;
    icon?: string;
    subcategories?: Category[];
}

function getSlug(cat: Category) {
    return cat.slug || cat.subslug || cat.childslug || "";
}

function findCategoryBySlug(cats: Category[], targetSlug: string): Category | null {
    for (const cat of cats) {
        if (getSlug(cat) === targetSlug) return cat;
        if (cat.subcategories) {
            const found = findCategoryBySlug(cat.subcategories, targetSlug);
            if (found) return found;
        }
    }
    return null;
}

export default function CategoryDrilldownPage() {
    const { slug } = useParams() as { slug: string[] };
    const slugArr = Array.isArray(slug) ? slug : [slug];
    const currentSlug = slugArr[slugArr.length - 1];
    const router = useRouter();

    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
    const [breadcrumb, setBreadcrumb] = useState<{ name: string; href: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const handleSearch = (term?: string) => {
        const searchValue = term !== undefined ? term : search;
        if (searchValue.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(searchValue.trim()).replace(/%20/g, "+")}&sort=new&page=1`;
        }
    }

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/data/categories.json`)
            .then(res => res.json())
            .then((data: Category[]) => {
                setAllCategories(data);

                const found = findCategoryBySlug(data, currentSlug);
                setCurrentCategory(found);

                const crumbs: { name: string; href: string }[] = [];
                let path = "";
                for (const s of slugArr) {
                    const cat = findCategoryBySlug(data, s);
                    path = path ? `${path}/${s}` : s;
                    if (cat) crumbs.push({ name: cat.name, href: `/categories/${path}` });
                }
                setBreadcrumb(crumbs);
                setLoading(false);
            });
    }, [currentSlug, JSON.stringify(slugArr)]);

    if (loading) {
        return (
            <main className="min-h-screen bg-bg-1 text-text-main">
                <div className="max-w-[1400px] mx-auto px-4 pb-5 md:pb-10">

                    {/* Search bar skeleton */}
                    <div className="w-full flex justify-center py-5 md:py-8">
                        <div className="w-full max-w-2xl h-[52px] bg-bg-2 border border-bg-3 rounded-full animate-pulse" />
                    </div>

                    <div className="md:px-4">
                        {/* Breadcrumb skeleton */}
                        <div className="flex items-center gap-2 mb-5">
                            <div className="h-4 w-20 bg-bg-2 rounded-full animate-pulse" />
                            <div className="h-4 w-3 bg-bg-3 rounded-full animate-pulse opacity-50" />
                            <div className="h-4 w-24 bg-bg-2 rounded-full animate-pulse" />
                        </div>

                        {/* Title skeleton */}
                        <div className="h-8 w-48 bg-bg-2 rounded-full animate-pulse mb-5 md:mb-8" />

                        {/* Category cards skeleton */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div
                                    key={i}
                                    className="min-h-[64px] md:min-h-[80px] px-6 md:px-8 rounded-3xl bg-bg-2 border border-bg-3 animate-pulse"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!currentCategory) {
        return (
            <div className="min-h-screen bg-bg-1 flex items-center justify-center text-text-main">
                <div className="text-center">
                    <p className="text-gray-400 text-lg mb-4">Kategorija nije pronađena.</p>
                    <Link href="/categories" className="text-[#6366f1] font-bold hover:underline">
                        Nazad na kategorije
                    </Link>
                </div>
            </div>
        );
    }

    const subcategories = currentCategory.subcategories || [];

    const parentHref = slugArr.length > 1
        ? `/categories/${slugArr.slice(0, -1).join('/')}`
        : "/categories";
    const searchPath = `/search/${slugArr.join('/')}?sort=new&page=1`;

    return (
        <main className="min-h-screen bg-bg-1 text-text-main">
            <div className="max-w-[1400px] mx-auto px-4 pb-5 md:pb-10">
                {/* SEARCH BAR CONTAINER */}
                <div className="w-full flex justify-center py-5 md:py-8">
                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        onSearch={handleSearch}
                        aiLink="/ai"
                    />
                </div>

                {/* CONTENT AREA */}
                <div className="md:px-4">
                    {/* BREADCRUMB */}
                    <div className="relative mb-5">
                        <div className="bg-bg-2 border border-bg-3 rounded-full py-3 px-4 md:px-6 overflow-x-auto no-scrollbar">
                            <div className="flex items-center gap-1.5 whitespace-nowrap min-w-0">
                                <Link href="/categories" className="text-gray-400 hover:text-text-main text-sm transition-colors shrink-0">Kategorije</Link>
                                {breadcrumb.map((crumb, idx) => (
                                    <span
                                        key={idx}
                                        className="flex items-center gap-1.5 shrink-0"
                                    >
                                        <span className="text-gray-500 text-sm">›</span>
                                        {idx === breadcrumb.length - 1 ? (
                                            <span className="text-white font-medium text-sm">{crumb.name}</span>
                                        ) : (
                                            <Link
                                                href={crumb.href}
                                                className="text-gray-400 hover:text-text-main text-sm transition-colors"
                                            >
                                                {crumb.name}
                                            </Link>
                                        )}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <h1 className="text-white text-2xl font-bold mb-5 md:mb-8">{currentCategory.name}</h1>

                    {/* SUBCATEGORIES GRID */}
                    {subcategories.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {subcategories.map((sub) => {
                                    const subSlug = getSlug(sub);
                                    const hasMore = sub.subcategories && sub.subcategories.length > 0;

                                    const href = hasMore
                                        ? `/categories/${[...slugArr, subSlug].join('/')}`
                                        : `/search/${[...slugArr, subSlug].join('/')}?sort=new&page=1`;

                                    return (
                                        <Link
                                            key={subSlug || sub.name}
                                            href={href}
                                            className="group flex items-center min-h-[64px] md:min-h-[80px] px-6 md:px-8 rounded-3xl bg-bg-2 border border-bg-3 transition-all cursor-pointer"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <span className="text-text-main text-lg font-medium transition group-hover:text-[#6366f1] block truncate">
                                                    {sub.name}
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* SHOW ALL ADS IN THIS CATEGORY */}
                            <div className="sticky bottom-[85px] md:bottom-10 z-[90] flex justify-center mt-10 mb-6 w-full pointer-events-none">
                                <Link
                                    href={searchPath}
                                    className="bg-[#5b42f3] text-white font-bold px-10 py-3.5 rounded-full hover:bg-[#4b35d6] transition-all active:scale-95 border border-white/10 pointer-events-auto"
                                >
                                    Prikaži sve oglase
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="py-10 text-center">
                            <p className="text-gray-400 mb-6">Nema potkategorija. Prikaži sve oglase u ovoj kategoriji.</p>
                            <Link
                                href={searchPath}
                                className="bg-[#5b42f3] text-white font-bold px-10 py-3.5 rounded-full hover:bg-[#4b35d6] transition-all"
                            >
                                Prikaži oglase
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
