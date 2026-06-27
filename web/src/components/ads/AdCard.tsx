"use client";

import React from "react";
import AdCardGrid from "./AdCardGrid";
import AdCardList from "./AdCardList";

interface AdCardProps {
  ad: any;
  isWishlisted?: boolean;
  onWishlistToggle?: (adId: number) => void;
  viewMode?: 'grid' | 'list';
  currentUser?: any;
}

export default function AdCard({ 
  ad, 
  isWishlisted = false, 
  onWishlistToggle, 
  viewMode = 'grid', 
  currentUser 
}: AdCardProps) {
  
  if (viewMode === 'list') {
    return (
      <AdCardList
        ad={ad}
        isWishlisted={isWishlisted}
        onWishlistToggle={onWishlistToggle}
        currentUser={currentUser}
      />
    );
  }

  return (
    <AdCardGrid
      ad={ad}
      isWishlisted={isWishlisted}
      onWishlistToggle={onWishlistToggle}
      currentUser={currentUser}
    />
  );
}

