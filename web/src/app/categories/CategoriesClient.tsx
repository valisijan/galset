"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import SearchBar from "@/components/SearchBar"

function CategoryIcon({ icon, name }: { icon?: string | null; name: string }) {
    const [imgError, setImgError] = useState(false)

    if (icon && !imgError) {
        const src = icon.startsWith("http") ? icon : (icon.startsWith("/") ? icon : `/${icon}`)
        return (
            <Image
                src={src}
                alt={name}
                width={28}
                height={28}
                className="transition"
                onError={() => setImgError(true)}
            />
        )
    }

    return null
}

interface MarketplaceClientProps {
    initialCategories: any[]
}

export default function MarketplaceClient({ initialCategories }: MarketplaceClientProps) {
    const [categories] = useState<any[]>(initialCategories)
    const [search, setSearch] = useState("")

    const handleSearch = (term?: string) => {
        const searchValue = term !== undefined ? term : search;
        if (searchValue.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(searchValue.trim()).replace(/%20/g, "+")}&sort=new&page=1`;
        }
    }

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
                    <h2 className="text-text-main text-2xl font-bold mb-5 md:mb-8">Sve kategorije</h2>

                    {/* KATEGORIJE GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {/* OGLASI U BLIZINI - First item */}
                        <Link
                            href="/search?sort=new&page=1"
                            className="group flex items-center gap-4 p-2 md:p-4 rounded-3xl bg-bg-2 border border-bg-3 
                       hover:bg-bg-2 hover:border-bg-3 transition-all cursor-pointer"
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
                            <span className="text-text-main text-lg font-medium transition group-hover:text-[#6366f1]">
                                Oglasi u blizini
                            </span>
                        </Link>

                        {categories.map((cat) => {
                            const isAllAds = cat.slug === "all-ads"

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
                                    className="group flex items-center gap-4 p-2 md:p-4 rounded-3xl bg-bg-2 border border-bg-3 
                             hover:bg-bg-2 hover:border-bg-3 transition-all cursor-pointer"
                                >
                                    <div className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <CategoryIcon icon={cat.icon} name={cat.name} />
                                    </div>
                                    <span className="text-text-main text-lg font-medium transition group-hover:text-[#6366f1]">
                                        {cat.name}
                                    </span>
                                </Link>
                            )
                        })}

                        {/* POKLANJAM - Last item */}
                        <Link
                            href="/search?price_min=0&price_max=0&sort=new&page=1"
                            className="group flex items-center gap-4 p-2 md:p-4 rounded-3xl bg-bg-2 border border-bg-3 
                       hover:bg-bg-2 hover:border-bg-3 transition-all cursor-pointer"
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
                            <span className="text-text-main text-lg font-medium transition group-hover:text-[#6366f1]">
                                Poklanjam
                            </span>
                        </Link>
                    </div>

                    {/* ALL ADS BUTTON */}
                    <div className="sticky bottom-[85px] md:bottom-10 z-[90] flex justify-center mt-10 mb-6 w-full pointer-events-none">
                        <Link
                            href="/search?sort=new&page=1"
                            className="bg-[#5b42f3] text-white font-bold px-10 py-3.5 rounded-full hover:bg-[#4b35d6] transition-all active:scale-95 border border-white/10 pointer-events-auto"
                        >
                            Prikaži sve oglase
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}
