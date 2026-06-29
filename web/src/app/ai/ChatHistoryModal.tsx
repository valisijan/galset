"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, Trash2, Loader2, Pen } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface ChatHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    sessions: any[];
    isSessionsLoading: boolean;
    activeSessionId?: string;
    onSelectSession: (id: string) => void;
    onDeleteSession: (id: string) => void;
    onRenameSession: (id: string, title: string) => void;
}

export default function ChatHistoryModal({
    isOpen,
    onClose,
    sessions,
    isSessionsLoading,
    activeSessionId,
    onSelectSession,
    onDeleteSession,
    onRenameSession,
}: ChatHistoryModalProps) {
    const { user } = useAuth();
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
    const [menuDirection, setMenuDirection] = useState<"down" | "up">("down");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) {
            setMenuOpenId(null);
            return;
        }

        window.history.pushState({ modal: "history" }, "");

        const handlePopState = () => {
            if (window.history.state?.modal !== "history") {
                onCloseRef.current();
            }
        };

        const handleGlobalClick = () => setMenuOpenId(null);

        window.addEventListener("popstate", handlePopState);
        window.addEventListener("click", handleGlobalClick);

        return () => {
            window.removeEventListener("popstate", handlePopState);
            window.removeEventListener("click", handleGlobalClick);

            if (window.history.state?.modal === "history") {
                window.history.back();
            }
        };
    }, [isOpen]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-sm h-[540px] bg-bg-2 rounded-4xl z-[9001] overflow-hidden flex flex-col"
                    >
                        {/* Centered Header */}
                        <div className="pt-8 pb-2 text-center flex-shrink-0">
                            <h3 className="text-text-main font-bold text-lg">Istorija razgovora</h3>
                        </div>

                        {/* List Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-2 sidebar-scrollbar flex flex-col">
                            {isSessionsLoading ? (
                                <div className="flex-1 flex items-center justify-center p-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-[#6366f1]" />
                                </div>
                            ) : !user ? (
                                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-6">
                                    <p className="text-gray-500 text-sm">
                                        Prijavite se da biste sačuvali vaše razgovore
                                    </p>
                                    <Link
                                        href="/auth"
                                        onClick={onClose}
                                        className="px-6 py-2.5 bg-[#5b42f3] hover:bg-[#4b35d6] text-white rounded-full font-semibold text-sm transition-all duration-200 cursor-pointer active:scale-95 shadow-md"
                                    >
                                        Prijava
                                    </Link>
                                </div>
                            ) : sessions.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center text-center py-6 text-gray-500 text-sm">
                                    Nema istorije razgovora.
                                </div>
                            ) : (
                                sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="relative group flex items-center w-full"
                                    >
                                        <button
                                            onClick={() => {
                                                onClose();
                                                setTimeout(() => {
                                                    onSelectSession(session.id);
                                                }, 50);
                                            }}
                                            className={`flex-1 text-left px-5 py-3 rounded-full transition-all pr-12 cursor-pointer font-medium text-sm ${
                                                activeSessionId === session.id
                                                    ? "bg-bg-3 text-text-main"
                                                    : "text-gray-400 hover:bg-bg-3/50 hover:text-text-main"
                                            }`}
                                        >
                                            <span className="truncate block pr-2">{session.title}</span>
                                        </button>

                                        {/* Action Dropdown Button */}
                                        <div className="absolute right-2 flex items-center">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    const container = e.currentTarget.closest('.overflow-y-auto');
                                                    if (container) {
                                                        const containerRect = container.getBoundingClientRect();
                                                        const spaceBelow = containerRect.bottom - rect.bottom;
                                                        setMenuDirection(spaceBelow < 110 ? "up" : "down");
                                                    } else {
                                                        const spaceBelow = window.innerHeight - rect.bottom;
                                                        setMenuDirection(spaceBelow < 150 ? "up" : "down");
                                                    }
                                                    setMenuOpenId(menuOpenId === session.id ? null : session.id);
                                                }}
                                                className="p-1.5 text-gray-500 hover:text-text-main transition-colors cursor-pointer rounded-full hover:bg-bg-3"
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </button>

                                            {/* Dropdown Menu */}
                                            <AnimatePresence>
                                                {menuOpenId === session.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95, y: menuDirection === "up" ? 5 : -5 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95, y: menuDirection === "up" ? 5 : -5 }}
                                                        className={`absolute right-0 ${menuDirection === "up" ? "bottom-7" : "top-8"} w-36 bg-bg-3 border border-bg-4 rounded-2xl p-1 shadow-xl z-50`}
                                                    >
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onRenameSession(session.id, session.title);
                                                                setMenuOpenId(null);
                                                            }}
                                                            className="w-full text-left px-3 py-2 rounded-xl text-text-main hover:bg-bg-4 flex items-center gap-2 text-sm cursor-pointer transition-colors"
                                                        >
                                                            <Pen className="w-3.5 h-3.5" /> Preimenuj
                                                        </button>
                                                        
                                                        <div className="h-px bg-bg-4 my-1 mx-1.5" />
                                                        
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteSession(session.id);
                                                                setMenuOpenId(null);
                                                            }}
                                                            className="w-full text-left px-3 py-2 rounded-xl text-red-500 hover:bg-red-500/10 flex items-center gap-2 text-sm cursor-pointer transition-colors"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" /> Obriši
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer - Cancel Button */}
                        <div className="w-full px-6 pb-6 pt-2 flex flex-col gap-3 flex-shrink-0">
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
        </AnimatePresence>,
        document.body
    );
}
