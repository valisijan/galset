"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";
import Link from "next/link";
import LogoutModal from "@/components/modals/LogoutModal";
import { List, Heart, Star, UserPlus, Wallet, History, LifeBuoy, LogOut, ChevronRight, Settings, Sparkles, SunMoon } from "lucide-react";
import { useCounts } from "@/context/CountsContext";
import ThemeModal from "@/components/modals/ThemeModal";

export default function AccountPage() {
    const { user, loading, logout } = useAuth();
    const { counts } = useCounts();
    const router = useRouter();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showThemeModal, setShowThemeModal] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/");
        }
    }, [user, loading, router]);

    if (loading || !user) return null;

    const menuItems = [
        { name: "Galset AI", icon: Sparkles, href: "/ai" },
        { name: "Moji oglasi", icon: List, href: "/my-ads/active" },
        { name: "Lista želja", icon: Heart, href: "/wishlist" },
        { name: "Novčanik", icon: Wallet, href: "/wallet" },
        { name: "Praćenja", icon: UserPlus, href: "/following" },
        { name: "Ocene", icon: Star, href: user ? `/${user.username}/reviews` : "/login" },
        { name: "Istorija", icon: History, href: "/history" },
        { name: "Podešavanja", icon: Settings, href: "/settings" },
        { name: "Pomoć", icon: LifeBuoy, href: "/help" },
    ];

    return (
        <div className="w-full max-w-xl mx-auto bg-bg-1 min-h-[calc(100vh-50px)] pt-6 pb-10 px-4">
            <div className="flex flex-col mb-8 items-start">
                <div className="flex items-center gap-4 mb-5 px-2">
                    <div className="rounded-full overflow-hidden shrink-0 border border-bg-2">
                        <Avatar
                            name={user.username || user.fullName || (user as any).name}
                            email={user.email}
                            imageUrl={user.profileImg}
                            size={64}
                        />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h1 className="text-xl font-bold text-text-main leading-tight mb-0.5">
                            {user.fullName || user.username || (user as any).name || "Korisnik"}
                        </h1>
                        <span className="text-gray-400 text-[15px]">@{user.username}</span>
                    </div>
                </div>

                <Link
                    href={`/${user.username}`}
                    className="w-full py-3 bg-bg-2 hover:bg-bg-3 transition-colors text-text-main text-center font-medium rounded-full text-sm border border-bg-3"
                >
                    Prikaži moj profil
                </Link>
            </div>

            <div className="flex flex-col gap-1">
                {menuItems.map(({ name, icon: Icon, href }) => {
                    const count =
                        name === "Moji oglasi" ? counts.myAds :
                            name === "Lista želja" ? counts.wishlist :
                                name === "Praćenja" ? counts.following :
                                    name === "Ocene" ? counts.reviews :
                                        null;

                    return (
                        <React.Fragment key={name}>
                        <Link
                            href={href}
                            className="flex items-center justify-between p-4 rounded-full transition-colors hover:bg-bg-2 group text-text-main"
                        >
                            <div className="flex items-center gap-4">
                                <Icon size={22} className={`${"text-gray-400"} group-hover:text-text-main transition-colors`} />
                                <span className="font-semibold text-[15px]">{name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                {count !== null && count > 0 && (
                                    <div className="min-w-[24px] h-[24px] px-1.5 rounded-full flex items-center justify-center text-[11px] font-bold text-text-main shadow-sm bg-bg-4 border border-bg-4">
                                        {count}
                                    </div>
                                )}
                                <ChevronRight size={18} className="text-gray-500 opacity-60" />
                            </div>
                        </Link>
                        {name === "Podešavanja" && (
                            <button
                                onClick={() => setShowThemeModal(true)}
                                className="flex items-center justify-between p-4 rounded-full transition-colors hover:bg-bg-2 group text-text-main cursor-pointer w-full"
                            >
                                <div className="flex items-center gap-4">
                                    <SunMoon size={22} className="text-gray-400 group-hover:text-text-main transition-colors" />
                                    <span className="font-semibold text-[15px]">Izgled</span>
                                </div>
                                <ChevronRight size={18} className="text-gray-500 opacity-60" />
                            </button>
                        )}
                        </React.Fragment>
                    );
                })}

                <div className="h-px w-full bg-bg-2 my-3" />

                <button
                    onClick={() => setShowLogoutModal(true)}
                    className="flex items-center justify-between p-4 rounded-full transition-colors hover:bg-red-500/10 group text-red-500 cursor-pointer w-full"
                >
                    <div className="flex items-center gap-4">
                        <LogOut size={22} className="text-red-500" />
                        <span className="font-semibold text-[15px]">Odjavi se</span>
                    </div>
                </button>
            </div>

            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={() => {
                    logout();
                    setShowLogoutModal(false);
                    router.push("/");
                }}
                email={user?.email}
                profileImg={user?.profileImg}
            />

            <ThemeModal
                isOpen={showThemeModal}
                onClose={() => setShowThemeModal(false)}
            />
        </div>
    );
}
