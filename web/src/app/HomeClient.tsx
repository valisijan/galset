"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import SearchBar from "@/components/SearchBar";
import AdCard from "@/components/ads/AdCard";
import Banners from "./Banners";
import Link from "next/link";
import Image from "next/image";
import AdScrollSection from "@/components/ads/AdScrollSection";
import { useAuth } from "@/context/AuthContext";

interface HomeClientProps {
  initialAds: any[];
  initialWishlistIds: number[];
  user: any;
}

export default function HomeClient({
  initialAds,
  initialWishlistIds,
  user
}: HomeClientProps) {
  const router = useRouter();
  const { sessionToken } = useAuth();
  const [search, setSearch] = useState("");
  const [wishlistIds, setWishlistIds] = useState<number[]>(initialWishlistIds);
  const [recommendations, setRecommendations] = useState<{
    categorySections: any[];
    wishlist: any[];
    history: any[];
  } | null>(null);
  const [loadingRecs, setLoadingRecs] = useState(true);

  const fetchRecommendations = async () => {
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/recommendations`;
      const headers: Record<string, string> = {};

      if (user && sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`;
      } else {
        const localHistoryStr = localStorage.getItem("galset_local_history");
        if (localHistoryStr) {
          const localHistory = JSON.parse(localHistoryStr);
          if (Array.isArray(localHistory) && localHistory.length > 0) {
            const categories = localHistory
              .map((h: any) => h.category)
              .filter(Boolean)
              .join(",");
            if (categories) {
              url += `?categories=${encodeURIComponent(categories)}`;
            }
          }
        }
      }

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRecommendations({
            categorySections: data.categorySections || [],
            wishlist: data.wishlist || [],
            history: data.history || []
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    } finally {
      setLoadingRecs(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [user, sessionToken]);

  const categories = [
    { name: "Oglasi u blizini", href: "/search?sort=new&page=1", icon: "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/icons/location.svg" },
    { name: "Vozila", href: "/search/vehicles?sort=new&page=1", icon: "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/icons/car.svg" },
    { name: "Nekretnine", href: "/categories/real-estate", icon: "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/icons/house.svg" },
    { name: "Poklanjam", href: "/search?price_min=0&price_max=0&sort=new&page=1", icon: "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/icons/gift.svg" },
    { name: "Sve kategorije", href: "/categories", icon: "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/icons/categories.svg" },
    { name: "Svi oglasi", href: "/search?sort=new&page=1", icon: "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/icons/all-ads.svg" },
  ];

  const handleSearch = (term?: string) => {
    const searchValue = term !== undefined ? term : search;
    if (searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim()).replace(/%20/g, "+")}&sort=new&page=1`);
    } else {
      router.push(`/search?sort=new&page=1`);
    }
  };

  const handleWishlistToggle = async (adId: number) => {
    if (!user) {
      window.dispatchEvent(new Event("open-auth-modal"));
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data.success) {
        if (data.action === "added") {
          setWishlistIds(prev => [...prev, adId]);
        } else {
          setWishlistIds(prev => prev.filter(id => id !== adId));
        }
        window.dispatchEvent(new Event("wishlistUpdate"));
        fetchRecommendations();
      }
    } catch (err) {
      console.error("Failed to toggle wishlist:", err);
      toast.error("Greška prilikom čuvanja oglasa");
    }
  };

  return (
    <main className="w-full min-h-screen bg-bg-1 text-text-main overflow-x-hidden">
      <div className="w-full max-w-[1300px] mx-auto px-4 md:px-6 overflow-hidden">

        {/* SEARCH BAR SECTION */}
        <div className="w-full flex justify-center py-5 md:py-8">
          <SearchBar
            value={search}
            onChange={setSearch}
            onSearch={handleSearch}
            aiLink="/ai"
          />
        </div>

        {/* HERO SECTION: REKLAME + CATEGORIES */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_550px] gap-6 mb-10 overflow-hidden">

          {/* REKLAME SLIDER */}
          <Banners />

          {/* CATEGORIES - DESKTOP & MOBILE */}
          <div className="grid grid-cols-2 gap-2 md:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="flex items-center bg-bg-2 gap-3 sm:gap-4 p-3 md:p-4 border border-bg-3 rounded-3xl active:scale-95 hover:border-gray-400 dark:hover:border-[#555] hover:bg-bg-3 transition-all group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-colors">
                  <Image 
                    src={cat.icon} 
                    alt={cat.name} 
                    width={28} 
                    height={28} 
                    className="opacity-95 group-hover:scale-110 transition-transform" 
                  />
                </div>
                <span className="font-bold text-xs sm:text-sm tracking-tight text-text-main group-hover:text-[#6366f1] transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>

        </div>

        {/* LATEST ADS SECTION */}
        <AdScrollSection
          title="Najnoviji oglasi"
          ads={initialAds}
          wishlistIds={wishlistIds}
          onWishlistToggle={handleWishlistToggle}
          currentUser={user}
          apiHref="/search?sort=new&page=1"
          topActionHref="/search?sort=new&page=1"
        />

        {/* PERSONALIZED RECOMMENDATIONS */}
        {loadingRecs ? (
          <>
            <AdScrollSection
              title="Preporučeno za vas"
              ads={[]}
              wishlistIds={[]}
              onWishlistToggle={handleWishlistToggle}
              currentUser={user}
              apiHref=""
              loading={true}
            />
            <AdScrollSection
              title="Popularno u kategorijama"
              ads={[]}
              wishlistIds={[]}
              onWishlistToggle={handleWishlistToggle}
              currentUser={user}
              apiHref=""
              loading={true}
            />
          </>
        ) : (
          <>
            {recommendations?.categorySections.map((section: any) => (
              <AdScrollSection
                key={section.categorySlug}
                title={section.title}
                ads={section.ads}
                wishlistIds={wishlistIds}
                onWishlistToggle={handleWishlistToggle}
                currentUser={user}
                apiHref={section.apiHref}
                topActionHref={section.apiHref}
              />
            ))}

            {/* WISHLIST SECTION */}
            {user && recommendations && recommendations.wishlist.length > 0 && (
              <AdScrollSection
                title="Lista želja"
                ads={recommendations.wishlist}
                wishlistIds={wishlistIds}
                onWishlistToggle={handleWishlistToggle}
                currentUser={user}
                apiHref="/wishlist"
                topActionHref="/wishlist"
              />
            )}

            {/* RECENTLY VIEWED SECTION */}
            {recommendations && recommendations.history.length > 0 && (
              <AdScrollSection
                title="Nedavno pregledano"
                ads={recommendations.history}
                wishlistIds={wishlistIds}
                onWishlistToggle={handleWishlistToggle}
                currentUser={user}
                apiHref="/history"
                topActionHref="/history"
              />
            )}
          </>
        )}

      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </main>
  );
}
