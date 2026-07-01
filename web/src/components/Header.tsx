"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";
import LogoutModal from "./modals/LogoutModal";
import { Bell, Plus, Search, Sparkles, User } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useCounts } from "@/context/CountsContext";
const FullLogo = "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/logo/galset-logo-full.svg";

interface HeaderProps {
  sidebarOpen?: boolean;
  toggleSidebar?: () => void;
}

export default function Header({ sidebarOpen, toggleSidebar }: HeaderProps) {
  const { user, logout, loading } = useAuth();
  const { theme, resolvedTheme } = useTheme();
  const { counts } = useCounts();

  const stableIsLoggedIn = !!user;


  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[1000] bg-bg-1 border-b border-bg-2 w-full ${stableIsLoggedIn ? 'md:hidden' : ''}`}>
        <div className="h-[50px] w-full max-w-[1300px] mx-auto px-4 md:px-6 flex items-center justify-between relative">

          {/* LEFT: Search & AI buttons */}
          <div className="flex-1 flex items-center justify-start gap-2">
            <Link href="/search" className="hidden md:flex items-center gap-2 bg-bg-2 text-text-main border border-bg-3 font-semibold hover:opacity-90 px-4 py-2 rounded-full transition-all text-sm whitespace-nowrap h-[38px]">
              <Search size={18} className="shrink-0" />
              <span>Pretraga</span>
            </Link>
            <Link href="/ai" className="flex items-center gap-2 md:bg-bg-2 text-text-main md:border md:border-bg-3 font-semibold hover:opacity-70 md:hover:opacity-90 p-2 md:px-4 md:py-2 rounded-full transition-all text-sm whitespace-nowrap h-auto md:h-[38px] -ml-2 md:ml-0">
              <Sparkles size={24} className="md:w-[18px] md:h-[18px]" />
              <span className="hidden md:inline">Galset AI</span>
            </Link>
          </div>

          {/* CENTER: Full Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <div className="relative h-[40px] w-[120px]">
                <Image
                  src={FullLogo}
                  alt="Galset"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* RIGHT: Notifications icon or Login button */}
          <div className="flex-1 flex items-center justify-end">
            {!stableIsLoggedIn ? (
              <Link href="/auth" className="flex items-center gap-2 bg-[#5b42f3] hover:bg-[#4b35d6] text-white font-semibold px-3 md:px-4 py-2 rounded-full transition-all duration-300 text-xs md:text-sm whitespace-nowrap h-[36px] md:h-[40px] active:scale-95">
                <User size={18} className="shrink-0" />
                <span>Prijava</span>
              </Link>
            ) : (
              <Link href="/notifications" className="p-2 -mr-2 text-text-main hover:opacity-70 transition-opacity relative">
                <Bell size={24} />
                {counts.notifications > 0 && (
                  <span className="absolute top-1 right-1 w-[9px] h-[9px] bg-red-500 rounded-full border-[2px] border-bg-1 pointer-events-none" />
                )}
              </Link>
            )}
          </div>
        </div>
      </header>
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          logout();
          setShowLogoutModal(false);
        }}
        email={user?.email}
      />
    </>
  );
}
