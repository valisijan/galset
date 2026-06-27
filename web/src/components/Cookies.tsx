"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export default function Cookies() {
    const { user } = useAuth();
    const [showBanner, setShowBanner] = useState(false);
    const pathname = usePathname();
    const isAuth = pathname?.startsWith("/auth") || pathname?.startsWith("/reset-password");

    useEffect(() => {
        if (user) {
            setShowBanner(false);
            const consent = localStorage.getItem("galset_consent");
            if (!consent) {
                localStorage.setItem("galset_consent", JSON.stringify({ ads: true, users: true, recommended: true, accepted: true }));
            }
            return;
        }
        const consent = localStorage.getItem("galset_consent");
        if (!consent) {
            setShowBanner(true);
        }
    }, [user]);

    useEffect(() => {
        const handleShow = () => setShowBanner(true);
        window.addEventListener("show-cookie-banner", handleShow);
        return () => window.removeEventListener("show-cookie-banner", handleShow);
    }, []);

    useEffect(() => {
        if (showBanner) {
            document.documentElement.classList.add("cookie-banner-active");
        } else {
            document.documentElement.classList.remove("cookie-banner-active");
        }
        return () => document.documentElement.classList.remove("cookie-banner-active");
    }, [showBanner]);

    const handleAcceptAll = () => {
        const consent = { ads: true, users: true, recommended: true, accepted: true };
        localStorage.setItem("galset_consent", JSON.stringify(consent));
        setShowBanner(false);
    };

    const handleDeclineAll = () => {
        const consent = { ads: false, users: false, recommended: false, accepted: true };
        localStorage.setItem("galset_consent", JSON.stringify(consent));
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <>
            <div className={`fixed ${isAuth ? "bottom-0" : "bottom-[60px]"} md:bottom-0 left-0 w-full bg-bg-2/80 backdrop-blur-xl border-t border-bg-3 px-5 py-6 md:px-8 md:py-8 z-[9999] shadow-[0_-8px_30px_rgba(0,0,0,0.05)] dark:shadow-none`}>
                <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-5 md:gap-12">
                    <div className="flex-1">
                        <h3 className="text-text-main font-bold text-base md:text-xl mb-1.5">Kolačići i privatnost</h3>
                        <p className="text-text-main/70 text-[11px] md:text-sm leading-relaxed">
                            Galset koristi kolačiće kako bi osigurao najbolje korisničko iskustvo, analizirao saobraćaj i personalizovao sadržaj. Neki su neophodni za rad sajta.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <button
                            onClick={handleDeclineAll}
                            className="flex-1 md:flex-none bg-bg-3 hover:bg-bg-4 text-text-main font-bold px-4 md:px-8 py-3 md:py-3.5 rounded-full transition-all text-[11px] md:text-sm active:scale-[0.98] cursor-pointer whitespace-nowrap"
                        >
                            Odbij sve
                        </button>
                        <button
                            onClick={handleAcceptAll}
                            className="flex-1 md:flex-none bg-[#5b42f3] hover:bg-[#4b35d6] text-white font-bold px-4 md:px-8 py-3 md:py-3.5 rounded-full transition-all active:scale-[0.98] cursor-pointer text-[11px] md:text-sm whitespace-nowrap"
                        >
                            Prihvati sve
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
