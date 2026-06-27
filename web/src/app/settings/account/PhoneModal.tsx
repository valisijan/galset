"use client";

import { useState, useEffect, useRef } from "react";
import Loader from "@/components/Loader";
import { motion, AnimatePresence } from "framer-motion";

interface PhoneModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialValue?: string;
    onSuccess?: (newPhone: string) => void;
}

export default function PhoneModal({ isOpen, onClose, initialValue = "", onSuccess }: PhoneModalProps) {
    const formatInitial = (val: string) => {
        if (!val) return "";
        if (!val.startsWith("+381")) return "+381 " + val.replace(/^\+/, '');
        return val.includes(" ") ? val : val.replace("+381", "+381 ");
    };

    const [phone, setPhone] = useState(formatInitial(initialValue));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;

        window.history.pushState({ modal: "phoneChange" }, "");

        const handlePopState = () => {
            onCloseRef.current();
        };

        window.addEventListener("popstate", handlePopState);
        document.body.classList.add("lock-scroll");

        return () => {
            window.removeEventListener("popstate", handlePopState);
            document.body.classList.remove("lock-scroll");

            if (window.history.state?.modal === "phoneChange") {
                window.history.back();
            }
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setPhone(formatInitial(initialValue));
            setError("");
        }
    }, [isOpen, initialValue]);

    const handleInputChange = (value: string) => {
        let processedValue = value;
        if (!processedValue.startsWith("+381 ") && processedValue !== "") {
            if (processedValue === "+381" || processedValue === "+38" || processedValue === "+3" || processedValue === "+") {
                processedValue = "+381 ";
            } else {
                processedValue = "+381 " + processedValue.replace(/^\+381\s?/, "").replace(/^\+/, "");
            }
        }
        
        if (processedValue === "") {
            setPhone("");
            setError("");
            return;
        }

        const digitsOnly = processedValue.slice(5).replace(/\D/g, "");
        if (digitsOnly.length > 15) return;

        setPhone("+381 " + digitsOnly);
        setError("");
    };

    const handleFocus = () => {
        setIsFocused(true);
        if (phone === "") {
            setPhone("+381 ");
        }
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (phone === "+381 ") {
            setPhone("");
        }
    };

    const handleSubmit = async () => {
        const rawDigits = phone.replace("+381 ", "").trim();
        if (!rawDigits) {
            setError("Molimo unesite broj telefona");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Greška pri čuvanju broja telefona");

            if (onSuccess) onSuccess(phone);
            onClose();
        } catch (err: any) {
            setError(err.message || "Nešto je pošlo po zlu");
        } finally {
            setSaving(false);
        }
    };

    const initialFormatted = formatInitial(initialValue);
    const hasNoChanges = phone === initialFormatted;
    const rawDigits = phone.replace("+381 ", "").trim();
    const isSaveDisabled = saving || hasNoChanges || !rawDigits;

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
                        className="relative bg-bg-2 w-full max-w-[400px] rounded-4xl z-[10100] overflow-hidden"
                    >
                        {/* Centered Header */}
                        <div className="pt-8 pb-1 text-center">
                            <h3 className="text-text-main font-bold text-lg">
                                {initialValue ? "Promenite" : "Dodajte"} broj telefona
                            </h3>
                        </div>

                        <div className="p-6">
                            {/* INPUT */}
                            <div className="relative mb-2">
                                <input
                                    type="text"
                                    id="phone-input"
                                    required
                                    autoComplete="off"
                                    value={phone}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                    className={`w-full border rounded-full bg-transparent px-5 py-4 text-text-main focus:outline-none transition-colors peer
                                    ${error ? "border-red-500 focus:border-red-500" : "border-bg-4 focus:border-[#6366f1]"}`}
                                />
                                <label
                                    htmlFor="phone-input"
                                    className={`
                                        absolute left-5 bg-bg-2 px-1 pointer-events-none
                                        transform transition-all
                                        peer-focus:-translate-y-2 peer-focus:text-sm
                                        ${(phone.length > 0 || error)
                                            ? "-translate-y-2 text-sm"
                                            : "translate-y-4 text-gray-500"}
                                        
                                        ${error
                                            ? "text-red-500 peer-focus:text-red-500"
                                            : "peer-focus:text-[#6366f1] text-gray-500"}
                                    `}
                                >
                                    Broj telefona
                                </label>

                                {error && (
                                    <div className="flex items-center gap-2 mt-2 ml-1">
                                        <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-text-main text-xs font-bold shrink-0">
                                            !
                                        </div>
                                        <span className="text-sm text-red-400">{error}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full px-6 pb-6 flex flex-col gap-3">
                            <button
                                onClick={handleSubmit}
                                disabled={isSaveDisabled}
                                className="w-full py-3 rounded-full bg-[#5b42f3] hover:bg-[#4b35d6] text-white font-bold transition-all duration-200 cursor-pointer text-base flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? <Loader /> : "Primeni"}
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
