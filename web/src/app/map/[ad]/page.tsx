"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { cityCoords } from "@/lib/cityCoords";
import Loader from "@/components/Loader";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import AdCardList from "@/components/ads/AdCardList";



const AdMap = dynamic(() => import("@/components/map/AdMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-bg-1">
            <Loader />
        </div>
    )
});

const DEFAULT_CENTER = { lat: 44.7866, lng: 20.4489 };

export default function FullMapPage() {
    const params = useParams();
    const router = useRouter();
    const adSlug = params?.ad as string;

    const parts = adSlug?.split("-") || [];
    const adId = parts[parts.length - 1];

    const [ad, setAd] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();
    const [wishlistIds, setWishlistIds] = useState<number[]>([]);
    const isWishlisted = wishlistIds.includes(ad?.id);
    const isOwner = user && ad && String(user.id) === String(ad.userId);

    useEffect(() => {
        const checkWishlist = async () => {
            if (!user) return;
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist`);
                const data = await res.json();
                if (data.success) {
                    setWishlistIds(data.ads.map((a: any) => a.id));
                }
            } catch (err) {
                console.error("Failed to check wishlist:", err);
            }
        };
        checkWishlist();
    }, [user]);

    const handleWishlistToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            window.dispatchEvent(new Event("open-auth-modal"));
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adId: ad.id }),
            });
            const data = await res.json();
            if (data.success) {
                if (data.action === "added") {
                    setWishlistIds(prev => [...prev, ad.id]);
                    toast.success("Dodato u listu želja");
                } else {
                    setWishlistIds(prev => prev.filter(id => id !== ad.id));
                    toast.success("Uklonjeno iz liste želja");
                }
                window.dispatchEvent(new Event("wishlistUpdate"));
            }
        } catch (err) {
            toast.error("Greška pri ažuriranju liste želja");
        }
    };

    useEffect(() => {
        if (adId) {
            setLoading(true);
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads/${adId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.ad) {
                        setAd(data.ad);
                    }
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [adId]);

    let coords = DEFAULT_CENTER;
    if (ad?.lat && ad?.lng) {
        coords = { lat: ad.lat, lng: ad.lng };
    } else if (ad?.city && cityCoords[ad.city]) {
        coords = cityCoords[ad.city];
    }

    return (
        <div className="flex flex-col h-full bg-bg-1 overflow-hidden relative w-full h-screen">

            {/* Floating Info Box */}
            {ad && (
                <div className="absolute top-4 left-4 right-4 md:left-auto md:top-10 md:right-10 z-[1000] md:w-[580px] pointer-events-auto shadow-lg">
                    <AdCardList
                        ad={ad}
                        isWishlisted={isWishlisted}
                        onWishlistToggle={() => handleWishlistToggle({ preventDefault: () => { }, stopPropagation: () => { } } as React.MouseEvent)}
                        currentUser={user}
                    />
                </div>
            )}

            {/* Map Container */}
            <div className="flex-1 relative min-h-0 bg-bg-1">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-bg-1 z-30">
                        <Loader />
                    </div>
                ) : (
                    <div className="absolute inset-0 w-full h-full overflow-hidden md:p-6">
                        <div className="w-full h-full md:rounded-3xl overflow-hidden md:border md:border-bg-3 relative z-10">
                            <AdMap
                                lat={coords.lat}
                                lng={coords.lng}
                                label={ad?.address || ad?.city}
                                street={ad?.address}
                                hideMarker={!adId}
                                noRounded={true}
                                scrollWheelZoom={true}
                                adSlug={adSlug}
                                fullScreen={true}
                                singleFingerPan={true}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
