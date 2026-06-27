"use client";

import { motion, AnimatePresence } from "framer-motion";

interface DeleteMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    messageContent: string;
}

export default function DeleteMessageModal({ isOpen, onClose, onConfirm, messageContent }: DeleteMessageModalProps) {
    const truncate = (str: string, max: number = 60) => {
        if (!str) return "";
        return str.length > max ? str.slice(0, max - 3) + "..." : str;
    };

    return (
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
                            <h3 className="text-text-main font-bold text-lg">Obrišite poruku?</h3>
                        </div>
 
                        <div className="flex flex-col items-center text-center mt-2">
                            <div className="mb-8 px-6 w-full text-center">
                                <p className="text-text-main opacity-70 text-[15px] leading-relaxed">
                                    Poruka <span className="font-semibold text-text-main">"{truncate(messageContent)}"</span> će biti trajno obrisana.
                                </p>
                            </div>
 
                            <div className="w-full px-6 pb-6 flex flex-col gap-3">
                                <button
                                    onClick={onConfirm}
                                    className="w-full py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold transition-all duration-200 cursor-pointer text-base"
                                >
                                    Obriši
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full py-3 rounded-full bg-bg-3 hover:bg-bg-3/80 text-white font-medium transition-all duration-200 cursor-pointer text-base"
                                >
                                    Otkaži
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
