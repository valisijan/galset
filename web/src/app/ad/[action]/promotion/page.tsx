"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import AdStepProgress from "../AdStepProgress";
import { toast } from "sonner";
import Loader from "@/components/Loader";
import { useAuth } from "@/context/AuthContext";
import InsufficientFundsModal from "../InsufficientFundsModal";

type PromotionType = "FEATURED" | "PRIORITY" | "TOP" | "COMBO";

export default function PromotionsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const action = params?.action as string || "add";
  const adId = searchParams?.get('adId');
  const query = action === 'edit' && adId ? `?adId=${adId}` : '';
  const { user, sessionToken, loading: authLoading } = useAuth();

  const isRedirectingRef = useRef(false);

  // Toast fires when leaving the promotion page without publishing
  useEffect(() => {
    return () => {
      if (!isRedirectingRef.current && action === "add") {
        if (!sessionStorage.getItem("adFlow_toasted")) {
          sessionStorage.setItem("adFlow_toasted", "true");
          toast.success("Oglas je sačuvan kao radna verzija");
        }
      }
    };
  }, [action]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  const [pricingData, setPricingData] = useState<any[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(true);

  const [visibilityDuration, setVisibilityDuration] = useState<30 | 60 | 100>(30);
  const [promoSelected, setPromoSelected] = useState<{
    FEATURED: boolean;
    PRIORITY: boolean;
    TOP: boolean;
    COMBO: boolean;
  }>({
    FEATURED: false,
    PRIORITY: false,
    TOP: false,
    COMBO: false
  });
  const [promoDurations, setPromoDurations] = useState<{
    FEATURED: 7 | 15 | 30;
    PRIORITY: 7 | 15 | 30;
    TOP: 7 | 15 | 30;
    COMBO: 7 | 15 | 30;
  }>({
    FEATURED: 7,
    PRIORITY: 7,
    TOP: 7,
    COMBO: 7
  });

  const [submitting, setSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [isInsufficientFundsModalOpen, setIsInsufficientFundsModalOpen] = useState(false);
  const [missingCredits, setMissingCredits] = useState(0);

  const [hitnoSelected, setHitnoSelected] = useState(false);
  const [initialHitnoActive, setInitialHitnoActive] = useState(false);

  const [initialActivePromos, setInitialActivePromos] = useState<Partial<Record<PromotionType, 7 | 15 | 30>>>({});
  const [initialVisibilityDuration, setInitialVisibilityDuration] = useState<30 | 60 | 100 | null>(null);

  const [imageCount, setImageCount] = useState(0);
  const [initialImageCount, setInitialImageCount] = useState(0);
  const [draft, setDraft] = useState<any>(null);
  const [loadingDraft, setLoadingDraft] = useState(action === "add");

  useEffect(() => {
    if (action !== "add" || !sessionToken || !user) return;

    setLoadingDraft(true);
    const storedDraftId = typeof window !== "undefined" ? localStorage.getItem("adFlow_draftId") : null;
    const fetchUrl = storedDraftId
      ? `${process.env.NEXT_PUBLIC_API_URL}/ads/draft?id=${storedDraftId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/ads/draft`;

    fetch(fetchUrl, {
      headers: {
        "Authorization": `Bearer ${sessionToken}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.draft) {
          setDraft(data.draft);
          if (data.draft.images && Array.isArray(data.draft.images)) {
            setImageCount(data.draft.images.length);
          }
        }
        setLoadingDraft(false);
      })
      .catch((err) => {
        console.error("Error loading draft on promotion page:", err);
        setLoadingDraft(false);
      });
  }, [action, sessionToken, user]);

  const [adOwnerId, setAdOwnerId] = useState<string | null>(null);

  useEffect(() => {
    if (adOwnerId === null) return;
    if (!authLoading && user && String(user.id) !== adOwnerId) {
      router.replace('/');
    }
  }, [user, authLoading, adOwnerId, router]);



  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/pricing`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPricingData(data.pricing);
        }
        setLoadingPrices(false);
      })
      .catch((err) => {
        console.error("Error loading prices:", err);
        setLoadingPrices(false);
      });
  }, []);

  useEffect(() => {
    if (action === "edit" && adId) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads/${adId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.ad) {
            const ad = data.ad;

            setAdOwnerId(String(ad.userId));

            if (ad.images && Array.isArray(ad.images)) {
              setInitialImageCount(ad.images.length);
            }

            let snappedVisibility: 30 | 60 | 100 = 30;
            if (ad.expiresAt && ad.createdAt) {
              const adDurationDays = Math.round(
                (new Date(ad.expiresAt).getTime() - new Date(ad.createdAt).getTime()) / (1000 * 60 * 60 * 24)
              );
              if (adDurationDays > 0) {
                if (adDurationDays <= 30) snappedVisibility = 30;
                else if (adDurationDays <= 60) snappedVisibility = 60;
                else snappedVisibility = 100;
              }
            }
            setVisibilityDuration(snappedVisibility);
            setInitialVisibilityDuration(snappedVisibility);

            if (ad.promotions && Array.isArray(ad.promotions)) {
              const now = new Date();
              const nextSelected = { FEATURED: false, PRIORITY: false, TOP: false, COMBO: false };
              const nextDurations = { FEATURED: 7 as 7 | 15 | 30, PRIORITY: 7 as 7 | 15 | 30, TOP: 7 as 7 | 15 | 30, COMBO: 7 as 7 | 15 | 30 };

              ad.promotions.forEach((p: any) => {
                const expiresAt = new Date(p.expiresAt);
                if (expiresAt > now) {
                  nextSelected[p.type as PromotionType] = true;

                  const diffDays = Math.round(
                    (expiresAt.getTime() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                  );
                  let snapped: 7 | 15 | 30 = 7;
                  if (diffDays > 7 && diffDays <= 15) snapped = 15;
                  else if (diffDays > 15) snapped = 30;

                  nextDurations[p.type as PromotionType] = snapped;
                }
              });

              setPromoSelected(nextSelected);
              setPromoDurations(nextDurations);

              const initialActives: Partial<Record<PromotionType, 7 | 15 | 30>> = {};
              (Object.keys(nextSelected) as PromotionType[]).forEach(type => {
                if (nextSelected[type]) {
                  initialActives[type] = nextDurations[type];
                }
              });
              setInitialActivePromos(initialActives);
            }
            if (ad.attributes?.isUrgent) {
              setHitnoSelected(true);
              setInitialHitnoActive(true);
            }
          }
        })
        .catch((err) => console.error("Error loading ad promotions:", err));
    }
  }, [action, adId]);

  const getVisibilityPrice = (days: number) => {
    const item = pricingData.find(p => p.category === 'promocija' && p.features?.durationDays === days && p.name.includes("Objava oglasa"));
    return item ? item.price : 0;
  };

  const getPromoPrice = (type: PromotionType, days: number) => {
    const item = pricingData.find(p => p.category === 'promocija' && p.features?.durationDays === days && p.features?.type === type);
    return item ? item.price : 0;
  };

  const getExtraImagePrice = () => {
    const item = pricingData.find(p => p.category === 'promocija' && p.name === "Dodatno postavljanje slika");
    return item ? item.price : 10;
  };

  const getExtraImagesCountToCharge = () => {
    if (action === 'edit') {
      return Math.max(0, imageCount - Math.max(15, initialImageCount));
    } else {
      return Math.max(0, imageCount - 15);
    }
  };

  const getExtraImagesCost = () => {
    return getExtraImagesCountToCharge() * getExtraImagePrice();
  };

  const getHitnoPrice = () => {
    const item = pricingData.find(p => p.category === 'promocija' && p.name.includes("Hitno"));
    return item ? item.price : 200;
  };

  const getSummaryItems = () => {
    const items = [];
    const isVisibilityUnchanged = action === 'edit' && initialVisibilityDuration !== null && visibilityDuration === initialVisibilityDuration;
    if (!isVisibilityUnchanged) {
      const visPrice = getVisibilityPrice(visibilityDuration);
      if (visPrice > 0) {
        items.push({
          label: `Objava oglasa (${visibilityDuration} dana)`,
          price: visPrice
        });
      }
    }

    (Object.keys(promoSelected) as Array<keyof typeof promoSelected>).forEach((type) => {
      if (promoSelected[type]) {
        const isPromoUnchanged = action === 'edit' && initialActivePromos[type as PromotionType] === promoDurations[type];
        if (!isPromoUnchanged) {
          const promoPrice = getPromoPrice(type as PromotionType, promoDurations[type]);
          const promoNamesMap: Record<string, string> = {
            FEATURED: 'Istaknuti oglas',
            PRIORITY: 'Prioritetni oglas',
            TOP: 'Na vrhu',
            COMBO: 'Premium oglas',
          };
          const name = promoNamesMap[type as PromotionType] || type;
          items.push({
            label: `${name} (${promoDurations[type]} dana)`,
            price: promoPrice
          });
        }
      }
    });

    if (hitnoSelected && !(action === 'edit' && initialHitnoActive)) {
      items.push({ label: 'Hitno značka', price: getHitnoPrice() });
    }

    const extraImagesToCharge = getExtraImagesCountToCharge();
    if (extraImagesToCharge > 0) {
      const extraCost = getExtraImagesCost();
      items.push({
        label: `${extraImagesToCharge} dodatnih slika`,
        price: extraCost
      });
    }

    return items;
  };

  const isPromoDisabled = (type: PromotionType): boolean => {
    if (type === 'COMBO') return promoSelected.FEATURED || promoSelected.PRIORITY || promoSelected.TOP;
    if (type === 'TOP') return promoSelected.PRIORITY || promoSelected.COMBO;
    if (type === 'FEATURED') return promoSelected.COMBO;
    if (type === 'PRIORITY') return promoSelected.TOP || promoSelected.COMBO;
    return false;
  };

  const togglePromo = (type: PromotionType) => {
    if (isPromoDisabled(type)) return;

    setPromoSelected(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const calculateTotal = () => {
    let total = 0;
    const isVisibilityUnchanged = action === 'edit' && initialVisibilityDuration !== null && visibilityDuration === initialVisibilityDuration;
    if (!isVisibilityUnchanged) {
      total += getVisibilityPrice(visibilityDuration);
    }
    (Object.keys(promoSelected) as Array<keyof typeof promoSelected>).forEach((type) => {
      if (promoSelected[type]) {
        const isPromoUnchanged = action === 'edit' && initialActivePromos[type as PromotionType] === promoDurations[type];
        if (!isPromoUnchanged) {
          total += getPromoPrice(type, promoDurations[type]);
        }
      }
    });

    if (hitnoSelected && !(action === 'edit' && initialHitnoActive)) {
      total += getHitnoPrice();
    }
    total += getExtraImagesCost();

    return total;
  };



  const clearAdLocalStorage = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("adFlow_") || key === "wasInsideAddAd") {
        localStorage.removeItem(key);
      }
    });
  };

  const handlePublish = async () => {
    setSubmitting(true);
    try {
      if (action === "edit" && adId) {
        const detailsStr = localStorage.getItem("adFlow_details");
        const details = detailsStr ? JSON.parse(detailsStr) : null;

        const editSelectedPromos = Object.entries(promoSelected)
          .filter(([type, selected]) => {
            if (!selected) return false;
            return initialActivePromos[type as PromotionType] !== promoDurations[type as PromotionType];
          })
          .map(([type]) => ({
            type,
            duration: promoDurations[type as PromotionType]
          }));

        if (hitnoSelected && !initialHitnoActive) {
          editSelectedPromos.push({ type: 'HITNO', duration: 0 } as any);
        }

        const isVisibilityChanged = initialVisibilityDuration === null || visibilityDuration !== initialVisibilityDuration;

        const payload: any = {
          selectedPromotions: editSelectedPromos,
          promotionType: editSelectedPromos.length > 0 ? editSelectedPromos[0].type : "standard",
          promotionDuration: editSelectedPromos.length > 0 ? editSelectedPromos[0].duration : visibilityDuration,
        };

        if (isVisibilityChanged) {
          payload.visibilityDuration = visibilityDuration;
        }

        if (details) {
          payload.title = details.title;
          payload.description = details.description || "";
          payload.price = details.toggle === "poklanjam" ? 0 : details.toggle === "kontakt" ? null : details.price ? parseFloat(details.price) : null;
          payload.currency = (details.toggle === "poklanjam" || details.toggle === "kontakt") ? null : details.currency;
          payload.condition = details.state;
          payload.country = details.country || "Srbija";
          payload.city = details.city || "";
          payload.address = details.address || details.street || "";
          payload.street = details.address || details.street || "";
          payload.contactPhone = details.phone || "";
          payload.images = details.images || [];
          payload.imageTempIds = details.imageTempIds || [];
          payload.isPriceOnRequest = details.toggle === "cena-na-upit" || details.toggle === "kontakt";
          payload.isContact = details.toggle === "cena-na-upit" || details.toggle === "kontakt";
          payload.attributes = details.attributes || {};
          payload.showPhone = details.showPhone !== undefined ? details.showPhone : true;
          payload.showAddress = details.showAddress !== undefined ? details.showAddress : true;

          const slugStr = localStorage.getItem("adFlow_selectedSlug");
          if (slugStr) {
            payload.category = slugStr;
          }
        }

        const headers: Record<string, string> = {
          "Content-Type": "application/json"
        };
        if (sessionToken) {
          headers["Authorization"] = `Bearer ${sessionToken}`;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads/${adId}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (data.success) {
          isRedirectingRef.current = true;
          clearAdLocalStorage();
          setIsPublishing(true);
          setTimeout(() => {
            window.location.href = `/ads/${(data.ad?.title || "oglas").toLowerCase().replace(/\s+/g, '-')}-${adId}`;
          }, 50);
        } else if (data.error === "INSUFFICIENT_FUNDS") {
          setMissingCredits(data.missingCredits || 0);
          setIsInsufficientFundsModalOpen(true);
        } else {
          toast.error("Greška: " + (data.error || "Nepoznata greška"));
        }
        return;
      }

      if (!draft || !draft.category) {
        toast.error("Nedostaju podaci o oglasu!");
        setSubmitting(false);
        return;
      }

      const imageUrls: string[] = draft.images || [];

      const allSelectedPromos = Object.entries(promoSelected)
        .filter(([_, selected]) => selected)
        .map(([type]) => ({
          type,
          duration: promoDurations[type as PromotionType]
        }));

      if (hitnoSelected) {
        allSelectedPromos.push({ type: 'HITNO', duration: 0 } as any);
      }

      const payload: any = {
        draftId: draft.id,
        title: draft.title,
        description: draft.description || "",
        price: (draft.isPriceOnRequest ?? draft.isContact) ? null : (draft.price !== null && draft.price !== undefined ? parseFloat(draft.price.toString()) : null),
        currency: (draft.isPriceOnRequest ?? draft.isContact) ? null : draft.currency,
        condition: draft.attributes?.condition || draft.condition,
        category: draft.category,
        country: draft.country || "Srbija",
        city: draft.city || "",
        address: draft.address || draft.street || "",
        street: draft.address || draft.street || "",
        contactPhone: draft.phone || "",
        images: imageUrls,
        imageTempIds: [],
        isPriceOnRequest: draft.isPriceOnRequest ?? draft.isContact,
        isContact: draft.isPriceOnRequest ?? draft.isContact,
        attributes: draft.attributes || {},
        showPhone: draft.showPhone !== undefined ? draft.showPhone : true,
        showAddress: draft.showAddress !== undefined ? draft.showAddress : true,
        visibilityDuration,
        selectedPromotions: allSelectedPromos,
        promotionType: allSelectedPromos.length > 0 ? allSelectedPromos[0].type : "standard",
        promotionDuration: allSelectedPromos.length > 0 ? allSelectedPromos[0].duration : visibilityDuration,
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        isRedirectingRef.current = true;
        clearAdLocalStorage();
        setIsPublishing(true);
        setTimeout(() => {
          window.location.href = "/";
        }, 50);
      } else if (data.error === "INSUFFICIENT_FUNDS") {
        setMissingCredits(data.missingCredits || 0);
        setIsInsufficientFundsModalOpen(true);
      } else {
        toast.error("Greška: " + (data.error || "Nepoznata greška"));
      }
    } catch (err) {
      console.error("Publish error:", err);
      toast.error("Greška pri objavljivanju oglasa.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPrices || loadingDraft) {
    return (
      <main className="min-h-screen bg-bg-1 text-text-main py-10 px-4 flex flex-col items-center">
        <div className="w-full max-w-[800px] space-y-8">
          <AdStepProgress currentStep={3} />

          <div className="w-full max-w-[800px] space-y-8 animate-pulse select-none">
            {/* Section 1 Skeleton: Vidljivost */}
            <div className="space-y-4">
              <div className="h-6 w-36 bg-bg-2 rounded-full" />
              <div className="bg-bg-2 border border-bg-3 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-4 w-full md:w-auto">
                  <div className="space-y-2">
                    <div className="h-5 w-48 bg-bg-4 rounded-full" />
                    <div className="h-4 w-32 bg-bg-4 rounded-full" />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-16 h-8 bg-bg-4 rounded-full" />
                    <div className="w-16 h-8 bg-bg-4 rounded-full" />
                    <div className="w-16 h-8 bg-bg-4 rounded-full" />
                  </div>
                </div>
                <div className="w-24 h-8 bg-bg-4 rounded-full" />
              </div>
            </div>

            {/* Section 2 Skeleton: Promocije */}
            <div className="space-y-4">
              <div className="h-6 w-36 bg-bg-2 rounded-full" />
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-6 bg-bg-2 border border-bg-3 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-4 w-full md:w-auto">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-bg-4 rounded" />
                        <div className="space-y-2">
                          <div className="h-5 w-40 bg-bg-4 rounded-full" />
                          <div className="h-4 w-64 bg-bg-4 rounded-full" />
                        </div>
                      </div>
                      <div className="flex gap-2 pl-8">
                        <div className="w-16 h-8 bg-bg-4 rounded-full" />
                        <div className="w-16 h-8 bg-bg-4 rounded-full" />
                        <div className="w-16 h-8 bg-bg-4 rounded-full" />
                      </div>
                    </div>
                    <div className="w-24 h-8 bg-bg-4 rounded-full pl-8 md:pl-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons Skeleton */}
            <div className="flex flex-col-reverse md:flex-row justify-between gap-3 pt-6">
              <div className="h-[56px] bg-bg-2 rounded-full w-full md:w-[180px]" />
              <div className="h-[56px] bg-bg-2 rounded-full w-full md:w-[180px]" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-1 text-text-main py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-[800px] space-y-8">
        <AdStepProgress currentStep={3} />

        <div className="space-y-8">

          {/* Section 1: Vidljivost oglasa */}
          <div className="text-left space-y-4">
            <h2 className="text-xl font-bold text-white">Vidljivost oglasa</h2>
            <div className="bg-bg-2 border border-bg-3 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-4 w-full md:w-auto">
                <div>
                  <p className="text-lg font-semibold text-text-main">Standardna vidljivost</p>
                  <p className="text-sm text-gray-400 mt-1">{visibilityDuration} dana vidljivosti oglasa</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[30, 60, 100].map((d) => (
                    <button
                      key={d}
                      onClick={() => setVisibilityDuration(d as any)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${visibilityDuration === d ? "bg-[#5b42f3] text-white hover:bg-[#4b35d6]" : "bg-bg-4 text-gray-300 hover:bg-[#5a5a5c]"}`}
                    >
                      {d} dana
                    </button>
                  ))}
                </div>
              </div>
              <div className="shrink-0">
                <p className="text-2xl font-bold text-[#6366f1]">
                  {(() => {
                    const isUnchanged = action === 'edit' && initialVisibilityDuration !== null && visibilityDuration === initialVisibilityDuration;
                    if (isUnchanged) return "0 kredita";
                    const p = getVisibilityPrice(visibilityDuration);
                    return p === 0 ? "Besplatno" : `${p} kredita`;
                  })()}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Promocije oglasa */}
          <div className="text-left space-y-4">
            <h2 className="text-xl font-bold text-white">Promocije oglasa</h2>
            <div className="space-y-4">
              {([
                { type: 'FEATURED', name: 'Istaknuti oglas', note: 'Oglas dobija pozadinu plave boje' },
                { type: 'PRIORITY', name: 'Prioritetni oglas', note: 'Oglas se svaka 3 dana vraca na vrh liste' },
                { type: 'TOP', name: 'Na vrhu', note: 'Oglas je na vrhu liste u drugom redu' },
                { type: 'COMBO', name: 'Premium oglas', note: 'Oglas je na vrhu liste u prvom redu i dobija pozadinu zlatne boje' }
              ] as const).map((promo) => {
                const isSelected = promoSelected[promo.type];
                const duration = promoDurations[promo.type];
                const price = getPromoPrice(promo.type, duration);
                const isDisabled = isPromoDisabled(promo.type);

                return (
                  <div
                    key={promo.type}
                    onClick={() => togglePromo(promo.type)}
                    className={`p-6 bg-bg-2 border rounded-3xl cursor-pointer transition flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${isSelected ? "border-[#6366f1]" : "border-bg-3"} ${isDisabled ? "opacity-40 pointer-events-none select-none" : ""}`}
                  >
                    <div className="space-y-4 w-full md:w-auto">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition ${isSelected ? "bg-[#5b42f3] hover:bg-[#4b35d6] border-[#6366f1]" : "border-bg-4"}`}>
                          {isSelected && <span className="text-white text-xs">✓</span>}
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-text-main">{promo.name}</p>
                          <p className="text-sm text-gray-400 mt-1">{promo.note}</p>
                        </div>
                      </div>

                      {/* 3 duration buttons */}
                      <div className="flex gap-2 pl-8" onClick={(e) => e.stopPropagation()}>
                        {([7, 15, 30] as const).map((d) => (
                          <button
                            key={d}
                            onClick={() => {
                              if (isDisabled) return;
                              if (!isSelected) {
                                setPromoSelected(prev => ({ ...prev, [promo.type]: true }));
                              }
                              setPromoDurations(prev => ({ ...prev, [promo.type]: d }));
                            }}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${isSelected && duration === d ? "bg-[#5b42f3] text-white hover:bg-[#4b35d6]" : "bg-bg-4 text-gray-300 hover:bg-[#5a5a5c]"}`}
                          >
                            {d} dana
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="shrink-0 pl-8 md:pl-0">
                      <p className="text-2xl font-bold text-[#6366f1]">
                        {action === 'edit' && initialActivePromos[promo.type] === duration ? "0 kredita" : `${price} kredita`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Dodaci oglasa */}
          <div className="text-left space-y-4">
            <h2 className="text-xl font-bold text-white">Dodaci oglasa</h2>
            <div
              onClick={() => setHitnoSelected(!hitnoSelected)}
              className={`p-6 bg-bg-2 border rounded-3xl cursor-pointer transition flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${hitnoSelected ? "border-[#6366f1]" : "border-bg-3"}`}
            >
              <div className="space-y-4 w-full md:w-auto">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition ${hitnoSelected ? "bg-[#5b42f3] hover:bg-[#4b35d6] border-[#6366f1]" : "border-bg-4"}`}>
                    {hitnoSelected && <span className="text-white text-xs">✓</span>}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-text-main">Hitno značka</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Privucite pažnju kupaca dodavanjem istaknute crvene oznake "HITNO" na vašem oglasu.
                    </p>
                  </div>
                </div>
              </div>

              <div className="shrink-0 pl-8 md:pl-0">
                <p className="text-2xl font-bold text-[#6366f1]">
                  {action === 'edit' && initialHitnoActive ? "0 kredita" : `${getHitnoPrice()} kredita`}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Pregled i Ukupno */}
          {(() => {
            const summaryItems = getSummaryItems();
            if (summaryItems.length === 0) return null;
            return (
              <div className="space-y-4 pt-4 px-2">
                <h3 className="text-lg font-bold text-white mb-2">Pregled porudžbine</h3>
                <div className="space-y-2">
                  {summaryItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm md:text-base">
                      <span className="text-gray-300 font-medium">{item.label}</span>
                      <span className="text-[#6366f1] font-bold">{item.price} kredita</span>
                    </div>
                  ))}
                </div>
                <div className="border-b border-bg-3 w-full h-[1px]" />
              </div>
            );
          })()}

          {/* Section 3: Ukupno */}
          <div className="flex items-center justify-between py-6">
            <h2 className="text-2xl font-bold text-text-main">Ukupno:</h2>
            <p className="text-3xl font-black text-[#6366f1]">{calculateTotal()} kredita</p>
          </div>

          <div className="flex flex-col-reverse md:flex-row justify-between gap-3 pt-4">
            <button
              onClick={() => {
                isRedirectingRef.current = true;
                router.push(`/ad/${action}/form${query}`);
              }}
              className="w-full md:w-auto px-14 md:px-20 py-4 rounded-full bg-bg-4 text-text-main hover:bg-[#5a5a5c] cursor-pointer transition-colors"
            >
              Nazad
            </button>
            <button
              onClick={handlePublish}
              disabled={submitting}
              className="w-full md:w-auto px-14 md:px-20 py-4 rounded-full bg-[#5b42f3] text-white font-semibold transition-all duration-300 hover:bg-[#4b35d6] cursor-pointer disabled:opacity-80 flex items-center justify-center min-w-[200px]"
            >
              {submitting ? <Loader /> : (action === "edit" ? "Sačuvaj" : "Objavi")}
            </button>
          </div>
        </div>
      </div>

      <InsufficientFundsModal
        isOpen={isInsufficientFundsModalOpen}
        onClose={() => setIsInsufficientFundsModalOpen(false)}
        missingCredits={missingCredits}
      />
    </main>
  );
}
