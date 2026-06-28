"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Heart, Eye, MessageSquare, Asterisk, ArrowUp, Crown } from "lucide-react";

interface AdCardListProps {
  ad: any;
  isWishlisted?: boolean;
  onWishlistToggle?: (adId: number) => void;
  currentUser?: any;
  rightAction?: React.ReactNode;
  showStats?: boolean;
  noBorder?: boolean;
  noHover?: boolean;
  noPadding?: boolean;
}

const NoImage = "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/assets/no-image.png";

const getOptimizedUrl = (url: string) => {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('ik.imagekit.io')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}tr=f-auto,w-600`;
  }
  return url;
};

const slugify = (text: string) => {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
};

const formatRelativeTime = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 60) return `pre ${diffMin} min`;
  if (diffHours < 24) return `pre ${diffHours} h`;
  if (diffDays <= 30) return `pre ${diffDays} d`;
  return date.toLocaleDateString('sr-RS');
};

export default function AdCardList({
  ad,
  isWishlisted = false,
  onWishlistToggle,
  currentUser,
  rightAction,
  showStats = false,
  noBorder = false,
  noHover = false,
  noPadding = false
}: AdCardListProps) {

  const adDetailHref = ad.status === "DRAFT" ? `/ad/add/form?draftId=${ad.id}` : `/ads/${slugify(ad.title)}-${ad.id}`;
  const isOwner = currentUser && String(currentUser.id) === String(ad.userId);
  const isFeatured = ad.promotions && ad.promotions.some((p: any) => p.type === 'FEATURED');
  const isTop = ad.promotions && ad.promotions.some((p: any) => p.type === 'TOP');
  const isPriority = ad.promotions && ad.promotions.some((p: any) => p.type === 'PRIORITY');
  const isPremium = ad.promotions && ad.promotions.some((p: any) => p.type === 'COMBO');
  const isUrgent = ad.attributes?.isUrgent;
  const displayTitle = ad.title || "(Bez naslova)";

  const WishlistButton = () => !isOwner && (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onWishlistToggle?.(ad.id);
      }}
      className="p-1 cursor-pointer transition-all hover:scale-110 flex items-center justify-center"
    >
      <Heart
        size={20}
        className={`transition-all duration-200 ${isWishlisted ? "text-red-500 fill-red-500 scale-110" : "text-text-main opacity-70"}`}
      />
    </button>
  );

  const PriceDisplay = () => {
    const salaryAttr = ad.attributes?.salary;
    const hasSalary = salaryAttr && (salaryAttr.max || salaryAttr.min);
    const isJob = ad.isJob || (ad.category && ["jobs", "ai-jobs", "admin-support", "security", "cleaning-maintenance", "care-sitting", "public-sector", "energy-mining", "finance-accounting", "seasonal-manual-labor", "construction", "it-software-design", "engineering-architecture", "beauty-wellness", "hr", "marketing-media", "medicine-pharmacy", "science-research", "education-culture", "agriculture-forestry", "repairs-services", "legal", "sales-retail", "production-warehouse", "students-internships", "transport-delivery", "hospitality-tourism", "events-entertainment"].includes(ad.category)) || hasSalary;

    let priceText: React.ReactNode;
    if (ad.isReserved) {
      priceText = <span className="text-gray-400">Rezervisano</span>;
    } else if (isJob) {
      const salaryVal = ad.price || (salaryAttr && (salaryAttr.max || salaryAttr.min));
      if (ad.isPriceOnRequest) {
        priceText = "Plata na upit";
      } else if (salaryVal) {
        const formatted = Number(salaryVal).toLocaleString("de-DE");
        priceText = <span>{formatted}&nbsp;€&nbsp;<span className="text-xs font-medium text-gray-400">/ mes.</span></span>;
      } else {
        priceText = "Plata na upit";
      }
    } else if (ad.isPriceOnRequest) {
      priceText = "Cena na upit";
    } else if (ad.price === 0) {
      priceText = "Poklanjam";
    } else if (ad.price) {
      priceText = <span>{ad.price.toLocaleString("de-DE")}&nbsp;€</span>;
    } else {
      priceText = "Po dogovoru";
    }
    return (
      <div className="flex flex-col">
        <p className="font-bold text-sm sm:text-lg text-[#6366f1]">{priceText}</p>
      </div>
    );
  };

  return (
    <div className={`rounded-3xl transition-all relative
      ${noPadding ? 'p-0' : 'p-1 md:p-2.5'}
      ${!noHover ? 'group hover:z-30 focus-within:z-30' : ''}
      ${isPremium
        ? `bg-bg-1 ${noBorder ? '' : 'border border-[#ffd700]'}`
        : isFeatured
          ? `bg-bg-1 ${noBorder ? '' : 'border border-[#6366f1]/40 shadow-[0_0_20px_rgba(99, 102, 241,0.15)]'}`
          : `bg-bg-2 ${noBorder ? '' : `border border-bg-3 ${noHover ? '' : 'hover:border-gray-400 dark:hover:border-[#555] hover:bg-bg-3'}`}`}
    `}>
      {(isPremium || isFeatured) && (
        <div className={`absolute inset-0 rounded-3xl pointer-events-none z-0 transition-colors
          ${isPremium 
            ? `bg-[#ffd700]/10 ${noHover ? '' : 'group-hover:bg-[#ffd700]/18'}` 
            : `bg-[#6366f1]/10 ${noHover ? '' : 'group-hover:bg-[#6366f1]/18'}`
          }
        `} />
      )}
      <Link href={adDetailHref} className="absolute inset-0 z-10" />

      <div className="flex gap-3 md:gap-4 relative z-20 pointer-events-none">
        <div className="w-32 h-32 md:w-40 md:h-40 bg-bg-2 rounded-[20px] md:rounded-2xl overflow-hidden relative shrink-0">
          <Image
            src={ad.images?.[0] ? getOptimizedUrl(ad.images[0]) : NoImage}
            alt={displayTitle}
            fill
            sizes="(max-width: 768px) 128px, 160px"
            className="object-cover"
          />
          {isUrgent && (
            <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 px-1.5 py-0.5 sm:px-2.5 sm:py-1 bg-[#e03131] text-white text-[8px] sm:text-[10px] font-black rounded-full uppercase z-10">HITNO</div>
          )}
          {ad.status === "DRAFT" && (
            <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 px-1.5 py-0.5 sm:px-2.5 sm:py-1 bg-[#2c2c2e] text-white text-[8px] sm:text-[10px] font-bold rounded-full uppercase z-10 border border-bg-3">
              Radna verzija
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
          <div className="flex justify-between items-start gap-2 w-full min-w-0">
            <h3 className="font-bold text-sm sm:text-lg text-text-main flex items-start gap-1.5 min-w-0 flex-1">
              {isPremium && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#5a5a5c] text-white shrink-0 mt-0.5 sm:mt-1" title="Premium oglas">
                  <Crown size={12} className="stroke-[3]" />
                </span>
              )}
              {isPriority && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#5a5a5c] text-white shrink-0 mt-0.5 sm:mt-1" title="Prioritetni oglas">
                  <Asterisk size={12} className="stroke-[3]" />
                </span>
              )}
              {isTop && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#5a5a5c] text-white shrink-0 mt-0.5 sm:mt-1" title="Na vrhu">
                  <ArrowUp size={12} className="stroke-[3]" />
                </span>
              )}
              <span className="line-clamp-2">{displayTitle}</span>
            </h3>
            <div className="pointer-events-auto">
              {rightAction ? rightAction : <WishlistButton />}
            </div>
          </div>
          <PriceDisplay />
          <div className="mt-auto flex flex-col gap-1 text-[10px] sm:text-xs text-gray-400 w-full">
            <div className="flex items-center gap-1">
              <MapPin size={12} className="shrink-0" />
              <span className="truncate">{ad.country || "Srbija"}, {ad.city}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} className="shrink-0" />
              <span>{formatRelativeTime(ad.createdAt)}</span>
            </div>
            {showStats && (
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1 shrink-0">
                  <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>{ad.viewscount || 0}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
                  <span>{ad.wishlistcount || 0}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
                  <span>{ad.messagescount || 0}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
