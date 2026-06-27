"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
const LOGO_URL = "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/logo/galset-logo-colored.svg";

interface HeaderProps {
    isSidebarOpen: boolean;
    toggleSidebar: (open: boolean) => void;
}

export default function Header({ isSidebarOpen, toggleSidebar }: HeaderProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-[#1c1c1e] shadow-sm dark:shadow-none border-b border-gray-200 dark:border-[#2c2c2e] transition-colors duration-200 h-[55px]">
            {/* Left Section: Placeholder to maintain layout balance */}
            <div className="flex items-center w-1/3" />

            {/* Center Section: Logo & Title - Always Centered */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center pointer-events-none md:pointer-events-auto">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    {mounted ? (
                        <Image
                            src={LOGO_URL}
                            alt="Galset Logo"
                            width={32}
                            height={32}
                            className="h-8 md:h-9 w-auto"
                            priority
                        />
                    ) : (
                        <div className="h-8 md:h-9 w-8" />
                    )}
                    <h1 className="text-base md:text-xl font-bold tracking-tight whitespace-nowrap">Centar za pomoć</h1>
                </Link>
            </div>

            <div className="flex items-center justify-end w-1/3 gap-3 z-10">
                {/* Mobile menu button */}
                <button
                    className="md:hidden p-2 rounded-lg bg-white dark:bg-[#2c2c2e] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#3c3c3e] shadow-sm"
                    onClick={() => toggleSidebar(!isSidebarOpen)}
                    aria-label="Toggle Sidebar"
                >
                    {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>
        </header>
    );
}
