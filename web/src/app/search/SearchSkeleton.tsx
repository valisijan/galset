import React from "react";

export default function SearchSkeleton({ isSimpleSearch = false, viewMode = 'grid' }: { isSimpleSearch?: boolean; viewMode?: 'grid' | 'list' }) {
    if (isSimpleSearch) {
        return (
            <div className="w-full min-h-screen bg-bg-1 text-text-main select-none">
                <div className="w-full max-w-[1300px] mx-auto px-4 md:px-6 pt-2 pb-6 animate-pulse">
                    {/* Centered search bar placeholder */}
                    <div className="w-full flex justify-center pt-4 pb-8 md:pt-6 md:pb-12">
                        <div className="w-full max-w-2xl h-11 md:h-13 bg-bg-2 border border-bg-3 rounded-full" />
                    </div>

                    {/* Search mode toggle placeholder */}
                    <div className="flex justify-center mb-10 -mt-4 md:-mt-8">
                        <div className="flex bg-bg-2 border border-bg-3 p-1 rounded-full gap-1">
                            <div className="px-6 py-1.5 rounded-full bg-bg-3/60 w-[88px] h-[34px]" />
                            <div className="px-6 py-1.5 rounded-full bg-bg-3/60 w-[100px] h-[34px]" />
                        </div>
                    </div>

                    {/* Heading for popular searches */}
                    <div className="h-7 w-48 bg-bg-2 rounded-full mb-6" />

                    {/* Popular searches tags */}
                    <div className="flex flex-nowrap md:flex-wrap overflow-x-auto md:overflow-x-visible no-scrollbar justify-start gap-2 w-auto md:w-full pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 mb-12">
                        {[72, 96, 64, 80, 88, 56, 112, 80, 72, 96, 64, 80].map((width, i) => (
                            <div
                                key={i}
                                style={{ width: `${width}px` }}
                                className="h-9 bg-bg-2 border border-bg-3 rounded-full shrink-0"
                            />
                        ))}
                    </div>

                    {/* Heading for categories */}
                    <div className="h-7 w-48 bg-bg-2 rounded-full mb-6" />

                    {/* Categories grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-10">
                        {Array.from({ length: 16 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 p-4 rounded-3xl bg-bg-2 border border-bg-3"
                            >
                                <div className="w-12 h-12 rounded-full bg-bg-3/40 shrink-0" />
                                <div className="h-5 bg-bg-3/50 rounded-full w-2/3" />
                            </div>
                        ))}
                    </div>

                    {/* Sticky button placeholder */}
                    <div className="sticky bottom-[85px] md:bottom-10 z-[90] flex justify-center mt-10 mb-6 w-full pointer-events-none">
                        <div className="h-12 w-48 bg-bg-2 border border-bg-3 rounded-full pointer-events-auto" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-bg-1 text-text-main select-none">
            <div className="w-full max-w-[1300px] mx-auto px-4 md:px-6 py-6 animate-pulse">
                {/* MOBILE TOP BAR */}
                <div className="lg:hidden flex flex-col gap-4 mb-6">
                    {/* Search bar placeholder */}
                    <div className="h-11 bg-bg-2 border border-bg-3 rounded-full w-full" />

                    {/* Mobile Filters and Sort placeholders */}
                    <div className="flex gap-2 w-full">
                        <div className="h-11 bg-bg-2 border border-bg-3 rounded-full flex-1" />
                        <div className="h-11 bg-bg-2 border border-bg-3 rounded-full flex-1" />
                    </div>
                </div>

                {/* DESKTOP LAYOUT */}
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Sidebar Filters (Desktop only) */}
                    <aside className="hidden lg:block w-[300px] shrink-0">
                        <div className="h-7 w-24 bg-bg-2 rounded-full mb-8" />
                        <div className="flex flex-col gap-6 w-full">
                            {/* Categories Box Skeleton */}
                            <div className="flex flex-col gap-3">
                                <div className="h-4 bg-bg-3 rounded-full w-20" />
                                <div className="border border-bg-3 rounded-3xl bg-bg-2 p-5 flex flex-col gap-5">
                                    {Array.from({ length: 6 }).map((_, idx) => (
                                        <div key={idx} className="h-4 bg-bg-3 rounded-full w-24" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0">
                        {/* Desktop Search Bar & Sort Dropdown */}
                        <div className="hidden lg:flex items-center gap-4 mb-8">
                            {/* Search bar placeholder */}
                            <div className="h-11 md:h-13 bg-bg-2 border border-bg-3 rounded-full flex-1" />
                            {/* Sort dropdown placeholder */}
                            <div className="h-11 bg-bg-2 border border-bg-3 rounded-full w-[220px]" />
                        </div>

                        {/* Ads Skeletons */}
                        {viewMode === 'list' ? (
                            <div className="flex flex-col gap-3">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="bg-bg-2 border border-bg-3 rounded-3xl p-1 md:p-2.5 flex gap-3 md:gap-4 relative overflow-hidden animate-pulse">
                                        <div className="w-32 h-32 md:w-40 md:h-40 bg-bg-3 rounded-[20px] md:rounded-2xl shrink-0" />
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div className="space-y-2">
                                                <div className="h-5 bg-bg-3 rounded-full w-3/4" />
                                                <div className="h-4 bg-bg-3 rounded-full w-1/4" />
                                            </div>
                                            <div className="space-y-1.5 mt-auto">
                                                <div className="h-3 bg-bg-3 rounded-full w-1/2" />
                                                <div className="h-3 bg-bg-3 rounded-full w-1/3" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="rounded-3xl border bg-bg-2 border-bg-3 overflow-hidden flex flex-col h-full relative">
                                        <div className="aspect-[4/3] bg-bg-3/30" />
                                        <div className="p-3 flex-1 flex flex-col">
                                            <div className="h-5 bg-bg-3/50 rounded-full w-3/4 mb-2" />
                                            <div className="h-4 bg-bg-3/40 rounded-full w-1/4 mb-3" />
                                            <div className="mt-auto pt-3 flex justify-between">
                                                <div className="h-3 bg-bg-3/30 rounded-full w-1/3" />
                                                <div className="h-3 bg-bg-3/30 rounded-full w-1/4" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

