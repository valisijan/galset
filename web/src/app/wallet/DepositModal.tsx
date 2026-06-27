"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function DepositModal() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [amountStr, setAmountStr] = useState("10");
    const [mounted, setMounted] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = "unset";
            };
        }
    }, [isModalOpen]);

    const amount = parseFloat(amountStr) || 0;
    const baseCredits = amount * 100;

    let bonusPercentage = 0;
    if (amount >= 10 && amount < 20) bonusPercentage = 5;
    else if (amount >= 20 && amount < 50) bonusPercentage = 10;
    else if (amount >= 50 && amount < 100) bonusPercentage = 20;
    else if (amount >= 100) bonusPercentage = 25;

    const bonusCredits = Math.floor(baseCredits * (bonusPercentage / 100));
    const totalCredits = baseCredits + bonusCredits;

    const handleContinue = () => {
        alert(`Implementiraj payment procesor za ${amount} EUR`);
    };

    const active = isFocused || (amountStr && amountStr.length > 0);
    const hasError = amount < 5 && amountStr !== "";

    if (!mounted) return (
        <button className="flex-1 md:flex-none bg-[#5b42f3] text-white font-bold py-3 px-6 md:px-10 md:min-w-[160px] rounded-full flex items-center justify-center gap-2 opacity-0">
            <Plus size={20} />
            Dopuni
        </button>
    );

    return (
        <>
            <button
                onClick={() => toast("Plaćanje će uskoro biti implementirano")}
                className="flex-1 md:flex-none bg-[#5b42f3] text-white font-bold py-3 px-6 md:px-10 md:min-w-[160px] rounded-full transition-all hover:bg-[#4b35d6] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
                <Plus size={20} />
                Dopuni
            </button>

            {createPortal(
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[10001] flex items-center justify-center px-4">
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsModalOpen(false)}
                                className="fixed inset-0 bg-black/80"
                            />

                            {/* Modal Content */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="relative w-full max-w-md bg-bg-2 rounded-3xl shadow-2xl overflow-hidden z-10 p-6 flex flex-col gap-6"
                            >
                                <div className="text-center">
                                    <h2 className="text-xl font-bold text-white">
                                        Dopuni kredite
                                    </h2>
                                </div>

                                <div className="flex flex-col gap-6">
                                    {/* Input section */}
                                    <div className="flex flex-col gap-2">
                                        <div className="relative flex items-center">
                                            <div className="relative flex-1">
                                                <input
                                                    type="number"
                                                    min="5"
                                                    value={amountStr}
                                                    onChange={(e) => setAmountStr(e.target.value)}
                                                    onFocus={() => setIsFocused(true)}
                                                    onBlur={() => setIsFocused(false)}
                                                    className={`w-full bg-transparent border px-4 py-4 rounded-full text-text-main focus:outline-none transition-all pr-12 text-lg font-bold text-left
                                                        ${hasError ? "border-red-500 focus:border-red-500" : isFocused ? "border-[#6366f1]" : "border-bg-3"}`}
                                                    placeholder=""
                                                />
                                                <label
                                                    className={`absolute left-4 pointer-events-none bg-bg-2 px-1 transition-all
                                                        ${active
                                                            ? `-top-2 text-sm ${hasError ? "text-red-500" : isFocused ? "text-[#6366f1]" : "text-gray-300"}`
                                                            : "top-1/2 -translate-y-1/2 text-gray-400"
                                                        }`}
                                                >
                                                    Iznos
                                                </label>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">
                                                    €
                                                </div>
                                            </div>
                                        </div>
                                        {hasError && (
                                            <div className="flex items-center gap-2 mt-1 ml-4">
                                                <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-text-main text-xs font-bold shrink-0">
                                                    !
                                                </div>
                                                <span className="text-sm text-red-400">Minimalan iznos je 5€</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Calculation results */}
                                    <div className="bg-bg-1 border border-bg-3 rounded-3xl p-5 space-y-4">
                                        <div className="flex justify-between items-center text-gray-300">
                                            <span>Osnovni krediti (x100)</span>
                                            <span className="font-bold">{baseCredits.toLocaleString("de-DE")}</span>
                                        </div>

                                        {bonusPercentage > 0 && (
                                            <div className="flex justify-between items-center text-green-400">
                                                <span>Bonus (+{bonusPercentage}%)</span>
                                                <span className="font-bold">+{bonusCredits.toLocaleString("de-DE")}</span>
                                            </div>
                                        )}

                                        <div className="h-[1px] bg-bg-3 w-full" />

                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 font-medium">Ukupno dobijate:</span>
                                            <div className="text-2xl font-black text-[#6366f1]">
                                                {totalCredits.toLocaleString("de-DE")} <span className="text-sm font-bold opacity-80">kredita</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 w-full">
                                        <button
                                            onClick={handleContinue}
                                            disabled={amount < 5}
                                            className="w-full bg-[#5b42f3] text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-[#4b35d6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            Nastavi
                                        </button>
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            className="w-full py-4 rounded-full bg-bg-3 hover:bg-bg-3/80 text-white font-medium transition-all duration-200 cursor-pointer text-base text-center"
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
            )}
        </>
    );
}
