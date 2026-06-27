import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import Loader from "@/components/Loader";
import { createPortal } from "react-dom";

const NoImage = "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/assets/no-image.png";

interface ReportAdModalProps {
    isOpen: boolean;
    onClose: () => void;
    adTitle: string;
    adPrice?: number | null;
    adCurrency?: string | null;
    adImage?: string | null;
    adId: number;
}

export default function ReportAdModal({ isOpen, onClose, adTitle, adPrice, adCurrency, adImage, adId }: ReportAdModalProps) {
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isDescFocused, setIsDescFocused] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;

        window.history.pushState({ modal: "reportAd" }, "");

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

            if (window.history.state?.modal === "reportAd") {
                window.history.back();
            }
        };
    }, [isOpen]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const adReasonOptions = [
        "Netačne informacije",
        "Lažne/Tuđe slike",
        "Nerealna cena",
        "Pogrešna kategorija",
        "Zabranjen sadržaj",
        "Drugo",
    ];

    const isDescriptionRequired = reason === "Drugo";

    const handleReportSubmit = async () => {
        if (!reason) return;
        if (isDescriptionRequired && !description.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/report`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetType: "AD",
                    targetId: adId,
                    reason: `Oglas: ${reason}`,
                    description: description.trim() || null,
                }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Prijava uspešno poslata");
                onClose();
            } else if (res.status === 401) {
                window.location.href = "/auth";
            } else {
                toast.error("Greška pri slanju prijave");
            }
        } catch (e) {
            toast.error("Greška, pokušajte ponovo");
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        return (
            <>
                {/* Centered Header */}
                <div className="pt-8 pb-1 text-center">
                    <h3 className="text-text-main font-bold text-lg">Prijavi oglas</h3>
                </div>

                {/* Ad Info Row */}
                <div className="px-6 pt-4 pb-2">
                    <p className="text-sm font-medium text-gray-400 mb-3 text-left">Prijavi oglas:</p>
                    <div className="flex items-center gap-4 bg-bg-2/50 p-2 rounded-2xl border border-bg-3 text-left">
                        <div className="w-16 h-12 rounded-xl overflow-hidden relative shrink-0 border border-bg-3">
                            <Image
                                src={adImage || NoImage}
                                alt={adTitle}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <p className="text-sm font-bold text-text-main truncate">{adTitle}</p>
                            <p className="text-xs font-bold text-[#6366f1]">
                                {adPrice === 0 ? "Poklanjam" : adPrice ? `${adPrice.toLocaleString("de-DE")} ${adCurrency || "RSD"}` : "Po dogovoru"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="px-6 pt-3 pb-4 flex flex-col gap-4 text-left">
                    {/* Custom Select with Floating Label */}
                    <div ref={dropdownRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setDropdownOpen(o => !o)}
                            className={`w-full min-h-[56px] bg-transparent border rounded-full px-4 py-4 text-left focus:outline-none transition-colors ${
                                dropdownOpen ? "border-[#6366f1]" : "border-bg-3"
                            }`}
                        >
                            <span className={reason ? "text-text-main text-sm" : "text-gray-400 text-sm"}>
                                {reason || ""}
                            </span>
                            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                        </button>

                        <label
                            className={`absolute left-4 pointer-events-none bg-bg-2 px-1 transition-all ${
                                reason || dropdownOpen
                                    ? `-top-2 text-sm ${dropdownOpen ? "text-[#6366f1]" : "text-gray-300"}`
                                    : "top-1/2 -translate-y-1/2 text-gray-400"
                            }`}
                        >
                            Razlog prijave
                        </label>

                        <AnimatePresence>
                            {dropdownOpen && (
                                <motion.ul
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute z-50 mt-2 w-full bg-bg-2 border border-bg-3 rounded-3xl overflow-y-auto max-h-56 shadow-xl custom-modal-scrollbar"
                                >
                                    {adReasonOptions.map((opt) => (
                                        <li
                                            key={opt}
                                            onMouseDown={() => {
                                                setReason(opt);
                                                setDropdownOpen(false);
                                            }}
                                            className={`px-4 py-3 cursor-pointer text-sm transition-colors ${
                                                reason === opt
                                                    ? "text-[#6366f1] font-semibold bg-[#6366f1]/10"
                                                    : "text-text-main hover:bg-bg-3"
                                            }`}
                                        >
                                            {opt}
                                        </li>
                                    ))}
                                </motion.ul>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Textarea with Floating Label */}
                    <div className="relative">
                        <textarea
                            value={description}
                            onChange={(e) => {
                                if (e.target.value.length <= 500) {
                                    setDescription(e.target.value);
                                }
                            }}
                            onFocus={() => setIsDescFocused(true)}
                            onBlur={() => setIsDescFocused(false)}
                            placeholder=""
                            rows={3}
                            className={`w-full bg-transparent border px-4 py-4 text-text-main text-sm focus:outline-none transition-all rounded-3xl resize-none min-h-[120px] custom-modal-scrollbar ${
                                isDescFocused ? "border-[#6366f1]" : "border-bg-3"
                            }`}
                        />
                        <label
                            className={`absolute left-4 transition-all pointer-events-none bg-bg-2 px-1
                                ${isDescFocused || description.length > 0
                                    ? `-top-2 text-sm ${isDescFocused ? "text-[#6366f1]" : "text-gray-300"}`
                                    : "top-4 text-gray-400"
                                }`}
                        >
                            Opis
                        </label>
                        <p className="text-xs text-gray-500 text-right mt-1">{description.length}/500</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full px-6 pb-6 flex flex-col gap-3">
                    <button
                        onClick={handleReportSubmit}
                        disabled={loading || !reason || (isDescriptionRequired && !description.trim())}
                        className="w-full py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold transition-all duration-200 cursor-pointer text-base flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? <Loader /> : "Prijavi"}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-full bg-bg-4 dark:bg-bg-3 hover:bg-bg-4/80 dark:hover:bg-bg-3/80 text-text-main font-medium transition-all duration-200 cursor-pointer text-base"
                    >
                        Otkaži
                    </button>
                </div>
            </>
        );
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="report-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-[999999] flex items-center justify-center p-4"
                >
                    {/* Backdrop */}
                    <div
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80"
                    />

                    {/* Modal Content */}
                    <motion.div
                        key="report-ad-content"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-sm bg-bg-2 rounded-4xl z-[1010] overflow-hidden"
                    >
                        {renderContent()}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
