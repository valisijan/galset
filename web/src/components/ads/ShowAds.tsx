"use client";

import React from "react";
import AdsList from "./AdsList";
import MobileFilters from "@/components/filters/MobileFilters";
import Filters from "@/components/filters/Filters";

export default function ShowAds({ category, section = "global" }: { category?: any; section?: "marketplace" | "automoto" | "realestate" | "global" }) {

    return (
        <div className="flex flex-col min-h-screen bg-black overflow-x-hidden">
            {/* Mobile */}
            <div className="lg:hidden mx-4 mt-4">
                <MobileFilters categoryId={category?.id} />
            </div>

            {/* Desktop Layout */}
            <div className="w-full px-2 max-w-[1200px] mx-auto py-3">
                <div className="flex flex-col lg:flex-row gap-8 items-start relative">
                    {/* Sidebar Card */}
                    <div className="hidden lg:block w-80 shrink-0 p-6">
                        <Filters categoryId={category?.id} />
                    </div>

                    {/* Main Ads Card */}
                    <div className="flex-1 w-full min-w-0">
                        <AdsList section={section} />
                    </div>
                </div>
            </div>
        </div>
    );
}
