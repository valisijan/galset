"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    adTitle: string;
}

export default function DeleteAdModal({ isOpen, onClose, onConfirm, adTitle }: ModalProps) {
    const [mounted, setMounted] = useState(false);
    const [selectedReason, setSelectedReason] = useState<string | null>(null);

    const REASONS = ["Prodato", "Odustao od prodaje", "Pravim novi oglas", "Drugo"];

    useEffect(() => {
        setMounted(true);
    }, []);

    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) {
            setSelectedReason(null);
            return;
        }

        window.history.pushState({ modal: "deleteAd" }, "");

        const handlePopState = () => {
            onCloseRef.current();
        };

        window.addEventListener("popstate", handlePopState);
        document.body.classList.add("lock-scroll");
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

        return () => {
            window.removeEventListener("popstate", handlePopState);
            document.body.classList.remove("lock-scroll");
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";

            if (window.history.state?.modal === "deleteAd") {
                window.history.back();
            }
        };
    }, [isOpen]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
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
                        className="relative w-full max-w-[400px] bg-bg-2 rounded-4xl z-[10100] overflow-hidden"
                    >
                        {/* Centered Header */}
                        <div className="pt-8 pb-2 text-center">
                            <h3 className="text-text-main font-bold text-lg">Obriši oglas?</h3>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col items-center mt-2">
                            <div className="mb-6 px-6 w-full text-center">
                                <p className="text-gray-500 dark:text-gray-400 text-[15px] leading-relaxed">
                                    Izaberite razlog brisanja oglasa. Nakon toga oglas <span className="font-semibold text-text-main">{adTitle}</span> će biti trajno obrisan.
                                </p>
                            </div>

                            {/* Radio Options */}
                            <div className="w-full px-6 mb-6 flex flex-col gap-2.5">
                                {REASONS.map((reason) => {
                                    const isSelected = selectedReason === reason;
                                    return (
                                        <button
                                            key={reason}
                                            type="button"
                                            onClick={() => setSelectedReason(reason)}
                                            className={`flex items-center justify-between px-6 py-3.5 rounded-full border text-left transition-all duration-200 cursor-pointer ${
                                                isSelected
                                                    ? "border-[#5b42f3] bg-[#5b42f3]/10 text-[#5b42f3] font-semibold"
                                                    : "border-gray-300 dark:border-bg-3 bg-bg-2 hover:border-gray-400 dark:hover:border-gray-500 text-text-main"
                                            }`}
                                        >
                                            <span className="text-base select-none">{reason}</span>
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                                isSelected ? "border-[#5b42f3]" : "border-gray-500"
                                            }`}>
                                                {isSelected && <div className="w-3 h-3 rounded-full bg-[#5b42f3]" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Action Buttons */}
                            <div className="w-full px-6 pb-6 flex flex-col gap-3">
                                <button
                                    onClick={() => selectedReason && onConfirm(selectedReason)}
                                    disabled={!selectedReason}
                                    className={`w-full py-3 rounded-full font-bold transition-all duration-200 text-base flex items-center justify-center ${
                                        selectedReason
                                            ? "bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                                            : "bg-red-600/30 text-white/50 cursor-not-allowed"
                                    }`}
                                >
                                    Obriši
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full py-3 rounded-full bg-bg-4 dark:bg-bg-3 hover:bg-bg-4/80 dark:hover:bg-bg-3/80 text-text-main font-medium transition-all duration-200 cursor-pointer text-base"
                                >
                                    Otkaži
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
