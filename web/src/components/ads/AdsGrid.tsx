"use client";

import React from "react";
import AdCard from "./AdCard";

interface AdsGridProps {
  ads: any[];
  loading: boolean;
  wishlistIds: number[];
  onWishlistToggle: (adId: number) => void;
  currentUser: any;
  section?: string;
  columns?: 3 | 4;
  viewMode?: 'grid' | 'list';
}

function GridSkeleton({ columns = 4 }: { columns?: 3 | 4 }) {
  const gridCols = columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4";
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${gridCols} gap-4`}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-3xl border bg-bg-2 border-bg-3 overflow-hidden flex flex-col h-full relative">
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
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
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
  );
}

export default function AdsGrid({
  ads,
  loading,
  wishlistIds,
  onWishlistToggle,
  currentUser,
  section,
  columns = 4,
  viewMode = 'grid',
}: AdsGridProps) {

  const gridCols = columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4";

  if (loading) {
    return viewMode === 'list' ? <ListSkeleton /> : <GridSkeleton columns={columns} />;
  }

  if (viewMode === 'list') {
    return (
      <div className="flex flex-col gap-3">
        {ads.map((ad) => (
          <AdCard
            key={ad.id}
            ad={ad}
            viewMode="list"
            isWishlisted={wishlistIds.includes(ad.id)}
            onWishlistToggle={onWishlistToggle}
            currentUser={currentUser}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${gridCols} gap-4`}>
      {ads.map((ad) => (
        <AdCard
          key={ad.id}
          ad={ad}
          viewMode="grid"
          isWishlisted={wishlistIds.includes(ad.id)}
          onWishlistToggle={onWishlistToggle}
          currentUser={currentUser}
        />
      ))}
    </div>
  );
}
