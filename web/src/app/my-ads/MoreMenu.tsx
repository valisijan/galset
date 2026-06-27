import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MoreVertical, Edit, Trash2, Power, Share2, RefreshCw, Clock, Megaphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MoreMenuProps {
    ad: any;
    onDelete: () => void;
    onDeactivate: () => void;
    onActivate: () => void;
    onRenew: () => void;
    onReserve: () => void;
    onAvailable: () => void;
}

export default function MoreMenu({ ad, onDelete, onDeactivate, onActivate, onRenew, onReserve, onAvailable }: MoreMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = () => setIsOpen(false);
        if (isOpen) {
            window.addEventListener("click", handleClickOutside);
        }
        return () => window.removeEventListener("click", handleClickOutside);
    }, [isOpen]);

    useEffect(() => {
        if (!containerRef.current) return;
        const cardElement = containerRef.current.closest(".group") as HTMLElement;
        if (cardElement) {
            if (isOpen) {
                cardElement.style.zIndex = "100";
            } else {
                cardElement.style.zIndex = "";
            }
        }
    }, [isOpen]);

    return (
        <div ref={containerRef} className={`relative ${isOpen ? "z-[250]" : "z-10"}`} onClick={(e) => e.stopPropagation()}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1.5 hover:bg-bg-3 rounded-full cursor-pointer transition-colors text-text-main opacity-70 hover:opacity-100"
            >
                <MoreVertical className="w-5 h-5" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-2 w-48 bg-bg-2 border border-bg-3 rounded-3xl shadow-2xl py-1.5 z-[150] overflow-hidden"
                        >
                            <div className="px-1.5 flex flex-col gap-0.5">
                                {ad.status === "DRAFT" ? (
                                    <button
                                        onClick={() => {
                                            setIsOpen(false);
                                            onDelete();
                                        }}
                                        className="w-full px-3 py-2 text-sm text-red-500 rounded-2xl hover:bg-red-500/10 flex items-center gap-3 transition-colors cursor-pointer text-left"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Obriši radnu verziju
                                    </button>
                                ) : (
                                    <>
                                        <Link href={`/ad/edit/form?adId=${ad.id}`} className="w-full px-3 py-2 text-sm text-text-main rounded-2xl hover:bg-bg-3 flex items-center gap-3 transition-colors cursor-pointer text-left">
                                            <Edit className="w-4 h-4" />
                                            Izmeni
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setIsOpen(false);
                                                onRenew();
                                            }}
                                            className="w-full px-3 py-2 text-sm text-text-main rounded-2xl hover:bg-bg-3 flex items-center gap-3 transition-colors cursor-pointer"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Obnovi
                                        </button>
                                        <Link
                                            href={`/ad/edit/promotion?adId=${ad.id}`}
                                            onClick={() => setIsOpen(false)}
                                            className="w-full px-3 py-2 text-sm text-text-main rounded-2xl hover:bg-bg-3 flex items-center gap-3 transition-colors cursor-pointer text-left"
                                        >
                                            <Megaphone className="w-4 h-4" />
                                            Promoviši
                                        </Link>
                                        {ad.status === "DEACTIVATED" ? (
                                            <button
                                                onClick={() => {
                                                    setIsOpen(false);
                                                    onActivate();
                                                }}
                                                className="w-full px-3 py-2 text-sm text-text-main rounded-2xl hover:bg-bg-3 flex items-center gap-3 transition-colors cursor-pointer"
                                            >
                                                <Power className="w-4 h-4" />
                                                Aktiviraj
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setIsOpen(false);
                                                    onDeactivate();
                                                }}
                                                className="w-full px-3 py-2 text-sm text-text-main rounded-2xl hover:bg-bg-3 flex items-center gap-3 transition-colors cursor-pointer"
                                            >
                                                <Power className="w-4 h-4" />
                                                Deaktiviraj
                                            </button>
                                        )}
                                        {ad.isReserved ? (
                                            <button
                                                onClick={() => {
                                                    setIsOpen(false);
                                                    onAvailable();
                                                }}
                                                className="w-full px-3 py-2 text-sm text-text-main rounded-2xl hover:bg-bg-3 flex items-center gap-3 transition-colors cursor-pointer"
                                            >
                                                <Clock className="w-4 h-4" />
                                                Ponovo dostupno
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setIsOpen(false);
                                                    onReserve();
                                                }}
                                                className="w-full px-3 py-2 text-sm text-text-main rounded-2xl hover:bg-bg-3 flex items-center gap-3 transition-colors cursor-pointer"
                                            >
                                                <Clock className="w-4 h-4" />
                                                Rezerviši
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                setIsOpen(false);
                                                if (navigator.share) {
                                                    navigator.share({
                                                        title: ad.title,
                                                        url: `${window.location.origin}/ads/${ad.title.toLowerCase().replace(/\s+/g, '-')}-${ad.id}`
                                                    }).catch(console.error);
                                                }
                                            }}
                                            className="w-full px-3 py-2 text-sm text-text-main rounded-2xl hover:bg-bg-3 flex items-center gap-3 transition-colors cursor-pointer"
                                        >
                                            <Share2 className="w-4 h-4" />
                                            Podeli
                                        </button>
                                        <div className="h-px bg-bg-3 my-0.5 mx-2" />
                                        <button
                                            onClick={() => {
                                                setIsOpen(false);
                                                onDelete();
                                            }}
                                            className="w-full px-3 py-2 text-sm text-red-500 rounded-2xl hover:bg-red-500/10 flex items-center gap-3 transition-colors cursor-pointer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Obrisi
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
