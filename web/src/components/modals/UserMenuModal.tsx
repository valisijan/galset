"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Avatar from "../Avatar";
import { LifeBuoy, LogOut, Settings, SunMoon, ChevronLeft, Check, Monitor, Sun, Moon } from "lucide-react";

interface UserMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
    anchorId?: string;
}

export default function UserMenuModal({ isOpen, onClose, onLogout }: UserMenuModalProps) {
    const { user } = useAuth();
    const { theme, setTheme } = useTheme();
    const [view, setView] = useState<"main" | "appearance">("main");

    const handleClose = () => {
        onClose();
        setTimeout(() => setView("main"), 300);
    };

    const themes: { id: "system" | "light" | "dark"; label: string }[] = [
        { id: "system", label: "Sistem" },
        { id: "light", label: "Svetla" },
        { id: "dark", label: "Tamna" },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* OVERLAY */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-[220]"
                    />

                    {/* MODAL CONTENT */}
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="fixed bottom-[90px] left-4 w-[248px] md:w-56 bg-bg-2 rounded-3xl p-2 z-[230] border border-bg-3 overflow-hidden"
                    >
                        <div className="relative overflow-hidden w-full">
                            <motion.div
                                animate={{ x: view === "main" ? "0%" : "-50%" }}
                                transition={{ type: "tween", duration: 0.22, ease: "easeInOut" }}
                                className="flex w-[200%]"
                            >
                                {/* MAIN MENU CONTENT */}
                                <div className="w-1/2 flex flex-col gap-1">
                                    {/* MOJ PROFIL */}
                                    <Link
                                        href={`/${user?.username}`}
                                        onClick={handleClose}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-bg-3 transition-colors text-text-main text-sm group"
                                    >
                                        <div className="rounded-full overflow-hidden shrink-0">
                                            <Avatar
                                                name={user?.username || user?.fullName}
                                                email={user?.email}
                                                imageUrl={user?.profileImg}
                                                size={24}
                                            />
                                        </div>
                                        <span className="font-medium">Moj profil</span>
                                    </Link>

                                    <div className="h-px bg-bg-3 my-0.5 mx-2" />

                                    <Link
                                        href="/settings"
                                        onClick={handleClose}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-bg-3 transition-colors text-text-main text-sm group"
                                    >
                                        <div className="w-5 h-5 flex items-center justify-center">
                                            <Settings size={18} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="font-medium">Podešavanja</span>
                                    </Link>

                                    <button
                                        onClick={() => setView("appearance")}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-bg-3 transition-colors text-text-main text-sm group cursor-pointer text-left w-full"
                                    >
                                        <div className="w-5 h-5 flex items-center justify-center">
                                            <SunMoon size={18} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="font-medium">Izgled</span>
                                    </button>

                                    <Link
                                        href="/help"
                                        onClick={handleClose}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-bg-3 transition-colors text-text-main text-sm group"
                                    >
                                        <div className="w-5 h-5 flex items-center justify-center">
                                            <LifeBuoy size={18} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="font-medium flex-1">Pomoć</span>
                                    </Link>

                                    <div className="h-px bg-bg-3 my-0.5 mx-2" />

                                    <button
                                        onClick={() => {
                                            onLogout();
                                            handleClose();
                                        }}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-bg-3 transition-colors text-text-main text-sm group cursor-pointer text-left w-full"
                                    >
                                        <div className="w-5 h-5 flex items-center justify-center">
                                            <LogOut size={18} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="font-medium">Odjavi se</span>
                                    </button>
                                </div>

                                {/* APPEARANCE SUBMENU CONTENT */}
                                <div className="w-1/2 flex flex-col gap-1">
                                    <button
                                        onClick={() => setView("main")}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-bg-3 transition-colors text-text-main text-sm group cursor-pointer text-left w-full font-semibold"
                                    >
                                        <div className="w-5 h-5 flex items-center justify-center">
                                            <ChevronLeft size={18} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <span>Nazad</span>
                                    </button>

                                    <div className="h-px bg-bg-3 my-0.5 mx-2" />

                                    {themes.map((t) => {
                                        const Icon = {
                                            system: Monitor,
                                            light: Sun,
                                            dark: Moon,
                                        }[t.id];
                                        return (
                                            <button
                                                key={t.id}
                                                onClick={() => setTheme(t.id)}
                                                className={`flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all duration-200 cursor-pointer text-left w-full text-sm group ${theme === t.id
                                                        ? "bg-[#6366f1]/10 text-[#6366f1]"
                                                        : "hover:bg-bg-3 text-text-main"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-5 h-5 flex items-center justify-center">
                                                        <Icon size={18} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                    <span className={theme === t.id ? "font-semibold" : "font-medium"}>
                                                        {t.label}
                                                    </span>
                                                </div>
                                                {theme === t.id && (
                                                    <Check size={16} className="text-[#6366f1]" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
