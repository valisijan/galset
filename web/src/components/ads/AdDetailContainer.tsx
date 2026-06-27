"use client"

import { useParams } from "next/navigation"
import AdsLayout from "@/app/ads/[ad]/AdsLayout"
import { useEffect, useState } from "react";
import Loader from "@/components/Loader";

export default function AdDetailContainer() {
    const params = useParams();
    const ad = params?.ad as string;
    const [adData, setAdData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [filters, setFilters] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        if (!ad) return;

        const parts = (ad as string).split("-");
        const id = parts[parts.length - 1];

        const fetchAd = async () => {
            try {
                // Fetch ad safely
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads/${id}`);
                const data = await res.json();

                // Fetch filters safely
                try {
                    const filtersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/data/filters-data.json`);
                    const filtersData = await filtersRes.json();
                    if (Array.isArray(filtersData)) {
                        setFilters(filtersData);
                    }
                } catch (filterErr) {
                    console.error("Filter fetch failed", filterErr);
                }

                // Fetch categories safely
                try {
                    const catsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/data/categories.json`);
                    const catsData = await catsRes.json();
                    if (Array.isArray(catsData)) {
                        setCategories(catsData);
                    }
                } catch (catErr) {
                    console.error("Categories fetch failed", catErr);
                }

                if (data.success) {
                    setAdData(data.ad);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Fetch error:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchAd();
    }, [ad]);

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-text-main">
                <p className="text-red-500">Oglas nije pronađen ili je došlo do greške.</p>
            </div>
        );
    }

    return <AdsLayout ad={adData} adSlug={ad as string} loading={loading} filters={filters} categories={categories} />;
}
