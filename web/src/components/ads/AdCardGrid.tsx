"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Heart, Asterisk, ArrowUp, Crown, Clock } from "lucide-react";

interface AdCardGridProps {
  ad: any;
  isWishlisted?: boolean;
  onWishlistToggle?: (adId: number) => void;
  currentUser?: any;
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
  const date = new Date(dateString);
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

export default function AdCardGrid({
  ad,
  isWishlisted = false,
  onWishlistToggle,
  currentUser
}: AdCardGridProps) {

  const adDetailHref = `/ads/${slugify(ad.title)}-${ad.id}`;
  const isOwner = currentUser && String(currentUser.id) === String(ad.userId);
  const isFeatured = ad.promotions && ad.promotions.some((p: any) => p.type === 'FEATURED');
  const isTop = ad.promotions && ad.promotions.some((p: any) => p.type === 'TOP');
  const isPriority = ad.promotions && ad.promotions.some((p: any) => p.type === 'PRIORITY');
  const isPremium = ad.promotions && ad.promotions.some((p: any) => p.type === 'COMBO');
  const isUrgent = ad.attributes?.isUrgent;

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
        size={18}
        className={`transition-all duration-200 ${isWishlisted ? "text-red-500 fill-red-500 scale-110" : "text-white opacity-90 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"}`}
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
        priceText = <span>{formatted}&nbsp;€&nbsp;<span className="text-[11px] font-medium text-gray-400">/ mes.</span></span>;
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
        <p className="font-bold text-[14px] text-[#6366f1]">{priceText}</p>
      </div>
    );
  };

  return (
    <div className={`rounded-3xl border transition-all group flex flex-col h-full relative overflow-hidden
      ${isPremium
        ? 'bg-[#ffd700]/10 border-[#ffd700] hover:bg-[#ffd700]/18'
        : isFeatured
          ? 'bg-[#6366f1]/10 border-[#6366f1]/40 shadow-[0_0_20px_rgba(99, 102, 241,0.15)] hover:bg-[#6366f1]/18'
          : 'bg-bg-2 border-bg-3 hover:border-[#555] hover:bg-bg-3'}
    `}>
      <Link href={adDetailHref} className="flex flex-col h-full">
        <div className="aspect-[4/3] relative overflow-hidden bg-bg-1">
          <Image
            src={ad.images?.[0] ? getOptimizedUrl(ad.images[0]) : NoImage}
            alt={ad.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
          <div className="absolute top-2 inset-x-2 flex justify-between items-center z-10">
            <div className="flex gap-1.5 items-center">
              {isUrgent && (
                <div className="px-2.5 py-1 bg-[#e03131] text-white text-[10px] font-black rounded-full uppercase">HITNO</div>
              )}
            </div>
            <WishlistButton />
          </div>
        </div>
        <div className={`p-3 flex-1 flex flex-col`}>
          <h3 className="font-bold text-[16px] leading-tight mb-1 text-text-main flex items-center gap-1.5 min-w-0 w-full">
            {isPremium && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#5a5a5c] text-white shrink-0" title="Premium oglas">
                <Crown size={12} className="stroke-[3]" />
              </span>
            )}
            {isPriority && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#5a5a5c] text-white shrink-0" title="Prioritetni oglas">
                <Asterisk size={12} className="stroke-[3]" />
              </span>
            )}
            {isTop && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#5a5a5c] text-white shrink-0" title="Na vrhu">
                <ArrowUp size={12} className="stroke-[3]" />
              </span>
            )}
            <span className="truncate">{ad.title}</span>
          </h3>
          <PriceDisplay />
          <div className="mt-auto pt-3 flex items-center justify-between text-[11px] text-gray-400">
            <div className="flex items-center gap-1 min-w-0">
              <MapPin size={12} className="shrink-0" />
              <span className="truncate">{ad.country || "Srbija"}, {ad.city}</span>
            </div>
            <span className="flex items-center gap-1 shrink-0">
              <Clock size={12} className="shrink-0" />
              {formatRelativeTime(ad.createdAt)}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
