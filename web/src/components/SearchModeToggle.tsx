"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface SearchModeToggleProps {
    activeMode: "ads" | "users";
    className?: string;
}

export default function SearchModeToggle({ activeMode, className = "" }: SearchModeToggleProps) {
    return (
        <div className={`flex bg-bg-2 border border-bg-3 p-1 rounded-full w-fit relative ${className}`}>
            <Link
                href="/search"
                className={`relative px-6 py-1.5 rounded-full text-sm font-bold transition-colors z-10 ${
                    activeMode === "ads" ? "text-white" : "text-gray-400 hover:text-text-main"
                }`}
            >
                {activeMode === "ads" && (
                    <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 bg-[#5b42f3] hover:bg-[#4b35d6] rounded-full -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                )}
                Oglasi
            </Link>
            <Link
                href="/search/users"
                className={`relative px-6 py-1.5 rounded-full text-sm font-bold transition-colors z-10 ${
                    activeMode === "users" ? "text-white" : "text-gray-400 hover:text-text-main"
                }`}
            >
                {activeMode === "users" && (
                    <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 bg-[#5b42f3] hover:bg-[#4b35d6] rounded-full -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                )}
                Korisnici
            </Link>
        </div>
    );
}
