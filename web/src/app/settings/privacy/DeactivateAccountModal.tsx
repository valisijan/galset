"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"
import Loader from "@/components/Loader"

interface DeactivateAccountModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void>
    loading: boolean
    email: string
}

export default function DeactivateAccountModal({
    isOpen,
    onClose,
    onConfirm,
    loading,
    email,
}: DeactivateAccountModalProps) {
    const [isChecked, setIsChecked] = useState(false)

    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) {
            setIsChecked(false);
            return;
        }

        window.history.pushState({ modal: "deactivateAccount" }, "");

        const handlePopState = () => {
            onCloseRef.current();
        };

        window.addEventListener("popstate", handlePopState);
        document.body.classList.add("lock-scroll");

        return () => {
            window.removeEventListener("popstate", handlePopState);
            document.body.classList.remove("lock-scroll");

            if (window.history.state?.modal === "deactivateAccount") {
                window.history.back();
            }
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80"
                        onClick={!loading ? onClose : undefined}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative bg-bg-2 w-full max-w-[400px] rounded-4xl z-[10100] overflow-hidden"
                    >
                        {/* Centered Header */}
                        <div className="pt-8 pb-1 text-center">
                            <h3 className="text-text-main font-bold text-lg">Deaktiviraj nalog</h3>
                        </div>

                        <div className="px-6 pb-6 mt-2">
                            <p className="text-gray-400 text-[13px] text-center leading-relaxed mb-8">
                                Nalog <span className="text-text-main font-bold">{email}</span> će biti privremeno deaktiviran, ali ga možete ponovo aktivirati kad god poželite. Vaši podaci su sigurni, a pristup nalogu možete povratiti jednostavnom prijavom u bilo kom trenutku.
                            </p>

                            {/* Checkbox inside modal */}
                            <div
                                onClick={() => setIsChecked(!isChecked)}
                                className="flex items-start gap-4 mb-2 cursor-pointer group"
                            >
                                <div className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-200 shrink-0 ${isChecked
                                        ? "bg-[#5b42f3] hover:bg-[#4b35d6] border-[#6366f1]"
                                        : "bg-bg-3 border-bg-4 group-hover:border-gray-500"
                                    }`}>
                                    {isChecked && <Check size={16} className="text-white font-bold" />}
                                </div>
                                <span className="text-[14px] text-gray-300 leading-snug select-none">
                                    Razumem da će ovo privremeno sakriti moj profil i sve moje podatke sa sajta.
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full px-6 pb-6 flex flex-col gap-3">
                            <button
                                onClick={onConfirm}
                                disabled={loading || !isChecked}
                                className={`w-full py-3 rounded-full font-bold transition-all duration-300 flex items-center justify-center text-base ${isChecked && !loading
                                        ? "bg-[#5b42f3] hover:bg-[#4b35d6] text-white cursor-pointer"
                                        : "bg-bg-3 text-gray-500 opacity-50 cursor-not-allowed"
                                    }`}
                            >
                                {loading ? <Loader /> : "Deaktiviraj nalog"}
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-3 rounded-full bg-bg-4 dark:bg-bg-3 hover:bg-bg-4/80 dark:hover:bg-bg-3/80 text-text-main font-medium transition-all duration-200 cursor-pointer text-base"
                            >
                                Zatvori
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
