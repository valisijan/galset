"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface RenameChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (newTitle: string) => void;
    currentTitle: string;
}

function FloatingInput({
    label,
    value,
    onChange,
    autoFocus,
}: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    autoFocus?: boolean;
}) {
    const [isFocused, setIsFocused] = useState(false);
    const active = isFocused || (value && value.length > 0);

    return (
        <div className="relative flex items-center w-full">
            <div className="relative flex-1">
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    autoFocus={autoFocus}
                    required
                    className={`w-full bg-transparent border px-4 py-4 rounded-full text-text-main focus:outline-none transition-all
                        ${isFocused ? "border-[#5b42f3]" : "border-bg-4"}`}
                />

                <label
                    className={`absolute left-4 transition-all pointer-events-none bg-bg-2 px-1
                        ${active
                            ? `-top-2 text-sm ${isFocused ? "text-[#5b42f3]" : "text-gray-300"}`
                            : `top-1/2 -translate-y-1/2 text-gray-400`
                        }`}
                >
                    {label}
                </label>
            </div>
        </div>
    );
}

export default function RenameChatModal({ isOpen, onClose, onConfirm, currentTitle }: RenameChatModalProps) {
    const [title, setTitle] = useState(currentTitle);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTitle(currentTitle);
        }
    }, [isOpen, currentTitle]);

    if (!mounted) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onConfirm(title.trim());
        }
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    {/* OVERLAY */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80"
                    />

                    {/* MODAL */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-[400px] bg-bg-2 rounded-4xl z-[10001] overflow-hidden"
                    >
                        <div className="pt-8 pb-2 text-center">
                            <h3 className="text-text-main font-bold text-lg">Preimenuj razgovor</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col items-center mt-2">
                            <div className="mb-6 px-6 w-full mt-2">
                                <FloatingInput
                                    label="Naziv razgovora"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="w-full px-6 pb-6 flex flex-col gap-3">
                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-full bg-[#5b42f3] hover:bg-[#4b35d6] text-white font-bold transition-all duration-200 cursor-pointer text-base"
                                >
                                    Sačuvaj
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-full py-3 rounded-full bg-bg-3 hover:bg-bg-3/80 text-white font-medium transition-all duration-200 cursor-pointer text-base"
                                >
                                    Otkaži
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
