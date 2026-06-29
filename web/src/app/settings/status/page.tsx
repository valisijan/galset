"use client";

import { useState, useEffect } from "react";
import { Calendar, MapPin, BadgeCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";

export default function StatusPage() {
    const { user } = useAuth();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;

        const fetchUser = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${user.id}`);
                const data = await res.json();
                if (data.success && data.user) {
                    setUserData(data.user);
                }
            } catch (err) {
                console.error("Failed to fetch user status info:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [user?.id]);

    const joinedDate = userData?.createdAt ? new Date(userData.createdAt) : new Date();
    const monthNames = ["januar", "februar", "mart", "april", "maj", "jun", "jul", "avgust", "septembar", "oktobar", "novembar", "decembar"];
    const formattedJoinedDate = userData?.createdAt
        ? `${joinedDate.getDate()}. ${monthNames[joinedDate.getMonth()]} ${joinedDate.getFullYear()}.`
        : "";

    let locationDisplay = "Nije navedena";
    if (userData?.country && userData?.city) {
        locationDisplay = `${userData.country}, ${userData.city}`;
    } else if (userData?.country) {
        locationDisplay = userData.country;
    } else if (userData?.city) {
        locationDisplay = userData.city;
    }

    const successfulSalesCount = userData?.successfulSales ?? 0;

    function formatSales(count: number) {
        const lastDigit = count % 10;
        const lastTwoDigits = count % 100;
        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
            return `${count} uspešnih prodaja`;
        }
        if (lastDigit === 1) {
            return `${count} uspešna prodaja`;
        }
        if (lastDigit >= 2 && lastDigit <= 4) {
            return `${count} uspešne prodaje`;
        }
        return `${count} uspešnih prodaja`;
    }

    return (
        <div className="flex flex-col gap-6 pb-20">
            <h1 className="text-text-main text-xl sm:text-2xl font-bold mt-4 text-center">Status naloga</h1>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader />
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {/* Datum kreiranja naloga */}
                    <div className="flex items-center gap-4 px-5 py-4 rounded-3xl bg-bg-2 border border-bg-3">
                        <Calendar size={20} className="text-text-main flex-shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-[10px] font-bold">Datum kreiranja naloga</span>
                            <span className="text-text-main font-bold text-sm">
                                {formattedJoinedDate}
                            </span>
                        </div>
                    </div>

                    {/* Lokacija */}
                    <div className="flex items-center gap-4 px-5 py-4 rounded-3xl bg-bg-2 border border-bg-3">
                        <MapPin size={20} className="text-text-main flex-shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-[10px] font-bold">Lokacija</span>
                            <span className="text-text-main font-bold text-sm">
                                {locationDisplay}
                            </span>
                        </div>
                    </div>

                    {/* Broj uspešnih prodaja */}
                    <div className="flex items-center gap-4 px-5 py-4 rounded-3xl bg-bg-2 border border-bg-3">
                        <BadgeCheck size={20} className="text-text-main flex-shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-[10px] font-bold">Broj uspešnih prodaja</span>
                            <span className="text-text-main font-bold text-sm">
                                {formatSales(successfulSalesCount)}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
