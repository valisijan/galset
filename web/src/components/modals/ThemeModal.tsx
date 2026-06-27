"use client";

import { useState, useEffect, useRef } from "react";
import { Monitor, Sun, Moon, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

interface ThemeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ThemeModal({ isOpen, onClose }: ThemeModalProps) {
    const { theme, setTheme } = useTheme();
    const [selectedTheme, setSelectedTheme] = useState(theme);

    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;

        window.history.pushState({ modal: "themeSettings" }, "");

        const handlePopState = () => {
            onCloseRef.current();
        };

        window.addEventListener("popstate", handlePopState);
        document.body.classList.add("lock-scroll");
        document.documentElement.classList.add("lock-scroll");

        return () => {
            window.removeEventListener("popstate", handlePopState);
            document.body.classList.remove("lock-scroll");
            document.documentElement.classList.remove("lock-scroll");

            if (window.history.state?.modal === "themeSettings") {
                window.history.back();
            }
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setSelectedTheme(theme);
        }
    }, [isOpen, theme]);

    const handleSave = () => {
        setTheme(selectedTheme as any);
        onClose();
    };

    const themes = [
        { id: 'system', name: 'Sistem', icon: Monitor },
        { id: 'light', name: 'Svetla', icon: Sun },
        { id: 'dark', name: 'Tamna', icon: Moon },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative bg-bg-2 w-full max-w-[400px] rounded-4xl overflow-hidden"
                    >
                        {/* Centered Header */}
                        <div className="pt-8 pb-1 text-center">
                            <h3 className="text-text-main font-bold text-lg">Izaberite temu</h3>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-8 flex flex-col gap-3">
                            {themes.map((t) => {
                                const Icon = t.icon;
                                const isActive = selectedTheme === t.id;

                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => setSelectedTheme(t.id as "system" | "light" | "dark")}
                                        className={`flex items-center justify-between px-5 py-4 rounded-3xl border transition-all duration-300 cursor-pointer ${isActive
                                            ? "bg-bg-3 border-[#6366f1] shadow-[0_0_15px_rgba(99, 102, 241,0.1)]"
                                            : "bg-bg-2 border-bg-3 hover:border-gray-500"
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2.5 rounded-xl ${isActive ? "bg-[#6366f1]/10 text-[#6366f1]" : "bg-bg-3 text-gray-400"}`}>
                                                <Icon size={20} />
                                            </div>
                                            <span className={`font-semibold ${isActive ? "text-text-main" : "text-gray-400"}`}>
                                                {t.name}
                                            </span>
                                        </div>
                                        {isActive && (
                                            <div className="w-6 h-6 rounded-full bg-[#5b42f3] hover:bg-[#4b35d6] flex items-center justify-center">
                                                <Check size={14} className="text-white" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Action Buttons Tray */}
                        <div className="w-full px-6 pb-6 flex flex-col gap-3">
                            <button
                                onClick={handleSave}
                                className="w-full py-3 rounded-full bg-[#5b42f3] hover:bg-[#4b35d6] text-white font-bold transition-all duration-200 cursor-pointer text-base flex items-center justify-center"
                            >
                                Primeni
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-3 rounded-full bg-bg-4 dark:bg-bg-3 hover:bg-bg-4/80 dark:hover:bg-bg-3/80 text-text-main font-medium transition-all duration-200 cursor-pointer text-base"
                            >
                                Otkaži
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
