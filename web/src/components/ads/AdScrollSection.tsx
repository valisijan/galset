"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import AdCard from "./AdCard";

interface AdScrollSectionProps {
  title: string;
  ads: any[];
  currentUser: any;
  wishlistIds: number[];
  onWishlistToggle: (adId: number) => void;
  apiHref: string;
  topActionHref?: string; // Optional top-right link (used for "Najnoviji oglasi")
  loading?: boolean;
}

export default function AdScrollSection({
  title,
  ads = [],
  currentUser,
  wishlistIds = [],
  onWishlistToggle,
  apiHref,
  topActionHref,
  loading = false
}: AdScrollSectionProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  // If loading, show skeleton carousel matching the Panel A height
  if (loading) {
    return (
      <div className="w-full mb-10 animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-7 w-48 bg-bg-3 rounded-full" />
        </div>
        {/* Desktop Skeleton */}
        <div className="hidden md:grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-bg-2 rounded-3xl border border-bg-3 overflow-hidden flex flex-col h-[320px]">
              <div className="aspect-[4/3] bg-bg-3" />
              <div className="p-4 flex-1 space-y-3 flex flex-col">
                <div className="h-5 bg-bg-3 rounded-full w-3/4" />
                <div className="h-4 bg-bg-3 rounded-full w-1/4" />
                <div className="mt-auto h-4 bg-bg-3 rounded-full w-1/2" />
              </div>
            </div>
          ))}
        </div>
        {/* Mobile Skeleton */}
        <div className="grid grid-cols-1 md:hidden">
          <div className="bg-bg-2 rounded-3xl border border-bg-3 overflow-hidden flex flex-col h-[300px] w-[80vw]">
            <div className="aspect-[4/3] bg-bg-3" />
            <div className="p-4 flex-1 space-y-3 flex flex-col">
              <div className="h-5 bg-bg-3 rounded-full w-3/4" />
              <div className="h-4 bg-bg-3 rounded-full w-1/4" />
              <div className="mt-auto h-4 bg-bg-3 rounded-full w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create list of items: ads capped at 7, then the "Prikaži više" button card
  const items = [...ads.slice(0, 7), { isShowMore: true }];

  // Divide items into Panel A and Panel B
  const panelAItems = items.slice(0, 4);
  const panelBItems = items.slice(4, 8);

  const ShowMoreCard = () => (
    <div className="rounded-3xl border border-bg-3 bg-bg-2 hover:border-gray-400 dark:hover:border-[#555] hover:bg-bg-3 transition-all h-full min-h-[300px] flex items-stretch">
      <Link
        href={apiHref}
        className="flex flex-col items-center justify-center p-6 text-center w-full group active:scale-[0.98] transition-all cursor-pointer"
      >
        <div className="w-14 h-14 rounded-full bg-[#6366f1]/10 group-hover:bg-[#6366f1]/20 text-[#6366f1] flex items-center justify-center mb-4 transition-colors">
          <ChevronRight size={28} />
        </div>
        <span className="font-bold text-base text-text-main group-hover:text-[#6366f1] transition-colors">
          Prikaži više
        </span>
        <span className="text-xs text-gray-400 mt-1 max-w-[180px]">
          Pogledaj sve oglase
        </span>
      </Link>
    </div>
  );

  return (
    <div className="w-full mb-10">
      {/* Header */}
      <div className="flex justify-between items-center gap-4 mb-3 min-w-0">
        <h2 className="text-text-main text-xl sm:text-2xl font-bold truncate min-w-0" title={title}>
          {title}
        </h2>
        {topActionHref && (
          <Link
            href={topActionHref}
            className="bg-[#5b42f3] text-white text-[10px] sm:text-xs font-bold px-4 py-1.5 sm:px-6 sm:py-2.5 rounded-full hover:bg-[#4b35d6] transition-colors shrink-0 whitespace-nowrap"
          >
            Prikaži više
          </Link>
        )}
      </div>

      {/* Desktop Panel Slider (Visible on md and up) */}
      <div className="relative w-full overflow-hidden hidden md:block py-2">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            width: "200%",
            transform: isScrolled ? "translateX(-50%)" : "translateX(0%)",
          }}
        >
          {/* Panel A (Items 0-3) */}
          <div className="w-1/2 grid grid-cols-4 gap-4 pr-2">
            {panelAItems.map((item: any, idx: number) => (
              <div key={item.id || `a-showmore-${idx}`} className="h-full">
                {item.isShowMore ? (
                  <ShowMoreCard />
                ) : (
                  <AdCard
                    ad={item}
                    isWishlisted={wishlistIds.includes(item.id)}
                    onWishlistToggle={onWishlistToggle}
                    currentUser={currentUser}
                  />
                )}
              </div>
            ))}
            {/* Fill empty grid spots if Panel A has fewer than 4 items */}
            {panelAItems.length < 4 &&
              Array.from({ length: 4 - panelAItems.length }).map((_, i) => (
                <div key={`empty-a-${i}`} />
              ))}
          </div>

          {/* Panel B (Items 4-7) */}
          <div className="w-1/2 grid grid-cols-4 gap-4 pl-2">
            {panelBItems.map((item: any, idx: number) => (
              <div key={item.id || `b-showmore-${idx}`} className="h-full">
                {item.isShowMore ? (
                  <ShowMoreCard />
                ) : (
                  <AdCard
                    ad={item}
                    isWishlisted={wishlistIds.includes(item.id)}
                    onWishlistToggle={onWishlistToggle}
                    currentUser={currentUser}
                  />
                )}
              </div>
            ))}
            {/* Fill empty grid spots if Panel B has fewer than 4 items */}
            {panelBItems.length < 4 &&
              Array.from({ length: 4 - panelBItems.length }).map((_, i) => (
                <div key={`empty-b-${i}`} />
              ))}
          </div>
        </div>

        {/* Absolute Navigational Arrow Buttons */}
        {items.length > 4 && (
          <>
            {/* Left Chevron: Visible only when scrolled (Panel B active) */}
            {isScrolled && (
              <button
                type="button"
                onClick={() => setIsScrolled(false)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 rounded-full flex items-center justify-center pointer-events-auto transition-all text-white cursor-pointer z-30 shadow-lg active:scale-95"
              >
                <ChevronLeft size={22} />
              </button>
            )}

            {/* Right Chevron: Visible only when not scrolled (Panel A active) */}
            {!isScrolled && (
              <button
                type="button"
                onClick={() => setIsScrolled(true)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 rounded-full flex items-center justify-center pointer-events-auto transition-all text-white cursor-pointer z-30 shadow-lg active:scale-95"
              >
                <ChevronRight size={22} />
              </button>
            )}
          </>
        )}
      </div>

      {/* Mobile Swipe Container (Visible on mobile) */}
      <div className="block md:hidden -mx-4 px-4 overflow-x-auto scrollbar-hide py-2">
        <div className="flex gap-4 w-max">
          {items.map((item: any, idx: number) => (
            <div key={item.id || `mob-showmore-${idx}`} className="w-[80vw] shrink-0">
              {item.isShowMore ? (
                <ShowMoreCard />
              ) : (
                <AdCard
                  ad={item}
                  isWishlisted={wishlistIds.includes(item.id)}
                  onWishlistToggle={onWishlistToggle}
                  currentUser={currentUser}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
