"use client";

import { useTheme } from "@/context/ThemeContext";
const LogoCollapsed = "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/logo/galset-logo-colored.svg";
const LogoExpanded = "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/logo/galset-logo-full.svg";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useCounts } from "@/context/CountsContext";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Search, Wallet, List, Heart, Star, UserPlus, MessageCircleMore, Bell, Sparkles, Home, History, Plus, PanelLeft, PanelLeftClose } from "lucide-react";
import UserMenuModal from "./modals/UserMenuModal";
import LogoutModal from "./modals/LogoutModal";
import Avatar from "./Avatar";

interface DesktopMenuProps {
    isOpen: boolean;
    toggleSidebar?: () => void;
}

export default function DesktopMenu({ isOpen, toggleSidebar }: DesktopMenuProps) {
    const { user, logout, loading } = useAuth();
    const { theme, resolvedTheme } = useTheme();
    const pathname = usePathname();
    const { counts } = useCounts();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const menuItems = [
        { name: "Početna", icon: Home, href: "/" },
        { name: "Pretraga", icon: Search, href: "/search" },
        { name: "Galset AI", icon: Sparkles, href: "/ai" },
        { name: "Novi oglas", icon: Plus, href: "/ad/add" },
        { name: "Moji oglasi", icon: List, href: "/my-ads/active" },
        { name: "Poruke", icon: MessageCircleMore, href: "/inbox" },
        { name: "Obaveštenja", icon: Bell, href: "/notifications" },
        { name: "Lista želja", icon: Heart, href: "/wishlist" },
        { name: "Novčanik", icon: Wallet, href: "/wallet" },
        { name: "Praćenja", icon: UserPlus, href: "/following" },
        { name: "Ocene", icon: Star, href: user ? `/${user.username}/reviews` : "/auth" },
        { name: "Istorija", icon: History, href: "/history" },
    ];

    if (!user && !loading) return null;

    return (
        <div
            className={`hidden md:flex h-[100dvh] bg-bg-1 fixed left-0 top-0 z-[140] transition-all duration-300 flex-col justify-between overflow-hidden ${isOpen ? "w-[260px]" : "w-[73px]"}`}
        >
            {/* TOP: LOGO */}
            <div className="py-2 px-3 flex items-center min-h-[66px]">
                {isOpen ? (
                    <div className="w-full flex items-center justify-between">
                        {/* Logo Link to home / */}
                        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                            <div className="relative w-[138px] h-[46px]">
                                <Image
                                    src={LogoExpanded}
                                    alt="Galset"
                                    fill
                                    className="object-contain object-left"
                                    priority
                                />
                            </div>
                        </Link>
                        {/* Collapse Button */}
                        {toggleSidebar && (
                            <button
                                onClick={toggleSidebar}
                                className="p-2 rounded-2xl hover:bg-bg-2 text-gray-400 hover:text-text-main transition-colors cursor-pointer"
                                aria-label="Collapse Sidebar"
                            >
                                <PanelLeftClose size={22} />
                            </button>
                        )}
                    </div>
                ) : (
                    /* Collapsed state with hover effect */
                    toggleSidebar && (
                        <button
                            onClick={toggleSidebar}
                            className="w-full flex items-center justify-center p-2 rounded-2xl hover:bg-bg-2 transition-colors cursor-pointer h-[50px] overflow-hidden group/logo relative"
                        >
                            {/* Logo: visible by default, fades on hover */}
                            <div className="relative w-[30px] h-[30px] transition-all duration-300 group-hover/logo:opacity-0 group-hover/logo:scale-75">
                                <Image
                                    src={LogoCollapsed}
                                    alt="Galset"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            {/* PanelLeft icon: hidden by default, shows on hover */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-all duration-300 scale-75 group-hover/logo:scale-100 text-text-main">
                                <PanelLeft size={22} />
                            </div>
                        </button>
                    )
                )}
            </div>

            {/* CENTER: NAVIGATION */}
            <div className="flex-1 flex flex-col justify-center px-3 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-hide py-4">
                {menuItems.map(({ name, icon: Icon, href }) => {
                    const isActive = pathname === href || 
                        (name === "Moji oglasi" && (pathname?.startsWith("/my-ads") ?? false)) ||
                        (name === "Poruke" && (pathname?.startsWith("/inbox") ?? false)) || 
                        (name === "Obaveštenja" && (pathname?.startsWith("/notifications") ?? false));
                    const count =
                        name === "Moji oglasi" ? counts.myAds :
                            name === "Lista želja" ? counts.wishlist :
                                name === "Praćenja" ? counts.following :
                                    name === "Ocene" ? counts.reviews :
                                        name === "Poruke" ? counts.unread :
                                            name === "Obaveštenja" ? counts.notifications :
                                                null;

                    return (
                        <Link
                            key={name}
                            href={href}
                            onClick={() => {
                                if (name === "Novi oglas") {
                                    sessionStorage.removeItem("adFlow_restoreSlug");
                                    sessionStorage.removeItem("adFlow_toasted");
                                    sessionStorage.setItem("adFlow_newSession", "true");
                                    localStorage.removeItem("adFlow_details");
                                    localStorage.removeItem("adFlow_selectedSlug");
                                    window.dispatchEvent(new Event("adFlowUpdate"));
                                }
                            }}
                            className={`flex items-center justify-between p-3 rounded-2xl transition-colors group relative ${isActive
                                ? "bg-bg-2"
                                : "hover:bg-bg-2"
                                }`}
                        >
                            <div className={`flex items-center transition-all duration-300 ${isOpen ? "gap-4" : "gap-0"}`}>
                                <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center relative">
                                    <Icon
                                        size={22}
                                        className={`transition-all duration-300 ${isActive ? "opacity-100 text-text-main" : "group-hover:text-text-main"}`}
                                    />
                                    {!isOpen && name === "Poruke" && counts.unread > 0 && (
                                        <div className="absolute top-[-2px] right-[-2px] w-[10px] h-[10px] bg-red-500 rounded-full border-[2px] border-bg-1 pointer-events-none z-10" />
                                    )}
                                    {!isOpen && name === "Obaveštenja" && counts.notifications > 0 && (
                                        <div className="absolute top-[-2px] right-[-2px] w-[10px] h-[10px] bg-red-500 rounded-full border-[2px] border-bg-1 pointer-events-none z-10" />
                                    )}
                                </div>
                                <span
                                    className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${isOpen ? "opacity-100 translate-x-0 w-auto" : "opacity-0 -translate-x-4 pointer-events-none w-0 overflow-hidden"
                                        }`}
                                >
                                    {name}
                                </span>
                            </div>

                            {isOpen && count !== null && count > 0 && (
                                <div className={`min-w-[24px] h-[24px] px-1.5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                                    name === "Poruke" || name === "Obaveštenja"
                                        ? "bg-red-500 border border-red-500 text-white"
                                        : "bg-bg-4 border border-bg-4 text-text-main"
                                    }`}>
                                    {count}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* BOTTOM: PROFILE */}
            <div className="px-2 py-3 relative">
                <button
                    onClick={() => setShowUserMenu(p => !p)}
                    className={`w-full flex items-start hover:bg-bg-2 p-2 rounded-2xl transition-all duration-300 cursor-pointer ${isOpen ? "gap-3" : "gap-0"}`}
                >
                    <div className="rounded-full overflow-hidden flex-shrink-0">
                        <Avatar
                            name={user?.username || user?.fullName || (user as any)?.name}
                            email={user?.email}
                            imageUrl={user?.profileImg}
                            size={40}
                        />
                    </div>
                    <div
                        className={`flex flex-col items-start overflow-hidden transition-all duration-300 ${isOpen ? "opacity-100 translate-x-0 w-auto" : "opacity-0 -translate-x-4 pointer-events-none w-0"
                            }`}
                    >
                        <span className="font-bold text-text-main text-sm truncate leading-tight mt-0.5">
                            {user?.username || user?.fullName || (loading ? "..." : "Korisnik")}
                        </span>
                        <span className="text-gray-400 text-xs truncate">
                            {user?.email || (loading ? "..." : "")}
                        </span>
                    </div>
                </button>
            </div>

            {/* MODALS */}
            <UserMenuModal
                isOpen={showUserMenu}
                onClose={() => setShowUserMenu(false)}
                onLogout={() => setShowLogoutModal(true)}
            />
            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={() => {
                    logout();
                    setShowLogoutModal(false);
                }}
                email={user?.email}
            />
        </div>
    );
}
