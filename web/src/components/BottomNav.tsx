"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCounts } from "@/context/CountsContext";
import { Home, Search, Plus, MessageCircleMore, User } from "lucide-react";
import Avatar from "./Avatar";

export default function BottomNav() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const { counts } = useCounts();

  if (loading) return null;
  if (pathname === "/ai" || pathname?.startsWith("/ai/")) return null;

  const navItems = [
    { name: "Početna", icon: Home, href: "/" },
    { name: "Pretraga", icon: Search, href: "/search" },
    { name: "Novi oglas", icon: Plus, href: user ? "/ad/add" : "/auth" },
    { name: "Poruke", icon: MessageCircleMore, href: user ? "/inbox" : "/auth", count: counts?.unread || 0 },
  ];

  return (
    <>
      <div className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-bg-1 border-t border-bg-2 flex items-center justify-around px-2 z-[200]">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.name === "Poruke" && pathname?.startsWith("/inbox"));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => {
                if (item.name === "Novi oglas") {
                  sessionStorage.removeItem("adFlow_restoreSlug");
                  sessionStorage.removeItem("adFlow_toasted");
                  sessionStorage.removeItem("adFlow_visitedPromotion");
                  sessionStorage.removeItem("adFlow_activeSession");
                  sessionStorage.setItem("adFlow_newSession", "true");
                  localStorage.removeItem("adFlow_details");
                  localStorage.removeItem("adFlow_selectedSlug");
                  localStorage.removeItem("adFlow_selectedCategoryPath");
                  localStorage.removeItem("adFlow_draftId");
                  localStorage.removeItem("adFlow_hasQualifyingFields");
                  window.dispatchEvent(new Event("adFlowUpdate"));
                }
              }}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative ${isActive ? "text-text-main" : "text-gray-400 hover:text-text-main"
                }`}
            >
              <div className="relative">
                <Icon size={26} className={isActive ? "text-text-main pb-[1px]" : "pb-[1px]"} />
                {(item.count !== undefined && item.count > 0) && (
                  <div className="absolute -top-1 -right-2 min-w-[18px] h-[18px] bg-red-500 rounded-full border-[2px] border-bg-1 flex items-center justify-center text-[10px] font-bold text-white z-10">
                    {item.count > 9 ? "9+" : item.count}
                  </div>
                )}
              </div>
            </Link>
          );
        })}

        <Link
          href={user ? "/account" : "/auth"}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative ${pathname === "/account" || pathname === "/auth" ? "text-text-main" : "text-gray-400 hover:text-text-main"
            }`}
        >
          {user ? (
            <div className="relative">
              <div className={`p-[2px] rounded-full transition-colors ${pathname === "/account" ? "bg-[#5b42f3] hover:bg-[#4b35d6]" : "bg-transparent"}`}>
                <Avatar
                  name={user?.username || user?.fullName || (user as any)?.name}
                  email={user?.email}
                  imageUrl={user?.profileImg}
                  size={26}
                />
              </div>
            </div>
          ) : (
            <User size={26} className={pathname === "/auth" ? "text-text-main" : ""} />
          )}
        </Link>
      </div>
    </>
  );
}
