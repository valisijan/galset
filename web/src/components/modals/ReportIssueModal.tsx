"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { 
    Search, Wallet, List, Heart, Star, UserPlus, 
    MessageCircleMore, Bell, Home, Sparkles, History, 
    Plus, Settings, ChevronDown, Check 
} from "lucide-react";
import Loader from "@/components/Loader";

interface ReportIssueModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ReportIssueModal({ isOpen, onClose }: ReportIssueModalProps) {
    const [type, setType] = useState<{ name: string, icon: any } | null>(null);
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isDescFocused, setIsDescFocused] = useState(false);
    
    const dropdownRef = useRef<HTMLDivElement>(null);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;

        window.history.pushState({ modal: "reportIssue" }, "");

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

            if (window.history.state?.modal === "reportIssue") {
                window.history.back();
            }
        };
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const issueOptions = [
        { name: "Početna", icon: Home },
        { name: "Pretraga", icon: Search },
        { name: "Galset AI", icon: Sparkles },
        { name: "Novi oglas", icon: Plus },
        { name: "Moji oglasi", icon: List },
        { name: "Poruke", icon: MessageCircleMore },
        { name: "Obaveštenja", icon: Bell },
        { name: "Lista želja", icon: Heart },
        { name: "Novčanik", icon: Wallet },
        { name: "Praćenja", icon: UserPlus },
        { name: "Ocene", icon: Star },
        { name: "Istorija", icon: History },
        { name: "Podešavanja", icon: Settings },
    ];

    const handleReportSubmit = async () => {
        if (!type || !description.trim()) {
            toast.error("Molimo vas izaberite tip problema i unesite opis.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/report-issue`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetType: type.name,
                    description: description.trim(),
                }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Problem uspešno prijavljen. Hvala vam!");
                onClose();
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
                <div className="pt-8 pb-3 text-center">
                    <h3 className="text-text-main font-bold text-lg">Prijavite problem</h3>
                </div>

                {/* Form */}
                <div className="px-6 pt-6 pb-4 flex flex-col gap-4 text-left">
                    {/* Custom Select with Floating Label */}
                    <div ref={dropdownRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setShowDropdown(o => !o)}
                            className={`w-full min-h-[56px] bg-transparent border rounded-full px-4 py-4 text-left focus:outline-none transition-colors flex items-center justify-between cursor-pointer ${
                                showDropdown ? "border-[#6366f1]" : "border-bg-3"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                {type ? (
                                    <>
                                        <type.icon size={18} className="text-[#6366f1]" />
                                        <span className="font-semibold text-text-main text-sm">{type.name}</span>
                                    </>
                                ) : (
                                    <span className="text-gray-400 text-sm"></span>
                                )}
                            </div>
                            <span className="pointer-events-none pr-1 text-gray-400">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}>
                                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                        </button>

                        <label
                            className={`absolute left-4 pointer-events-none bg-bg-2 px-1 transition-all ${
                                type || showDropdown
                                    ? `-top-2 text-sm ${showDropdown ? "text-[#6366f1]" : "text-gray-300"}`
                                    : "top-1/2 -translate-y-1/2 text-gray-400"
                            }`}
                        >
                            Mesto problema
                        </label>

                        <AnimatePresence>
                            {showDropdown && (
                                <motion.ul
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute z-50 mt-2 w-full bg-bg-2 border border-bg-3 rounded-3xl overflow-y-auto max-h-56 shadow-xl custom-modal-scrollbar"
                                >
                                    {issueOptions.map((opt) => (
                                        <li
                                            key={opt.name}
                                            onMouseDown={() => {
                                                setType(opt);
                                                setShowDropdown(false);
                                            }}
                                            className={`px-4 py-3 cursor-pointer text-sm transition-colors flex items-center justify-between ${
                                                type?.name === opt.name
                                                    ? "text-[#6366f1] font-semibold bg-[#6366f1]/10"
                                                    : "text-text-main hover:bg-bg-3"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <opt.icon size={18} className={type?.name === opt.name ? "text-[#6366f1]" : "text-gray-400"} />
                                                <span>{opt.name}</span>
                                            </div>
                                            {type?.name === opt.name && <Check size={16} className="text-[#6366f1]" />}
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
                                if (e.target.value.length <= 1000) {
                                    setDescription(e.target.value);
                                }
                            }}
                            onFocus={() => setIsDescFocused(true)}
                            onBlur={() => setIsDescFocused(false)}
                            placeholder=""
                            rows={4}
                            className={`w-full bg-transparent border px-4 py-4 text-text-main text-sm focus:outline-none transition-all rounded-3xl resize-none min-h-[140px] custom-modal-scrollbar ${
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
                            Opis problema
                        </label>
                        <p className="text-xs text-gray-500 text-right mt-1">{description.length}/1000</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full px-6 pb-6 flex flex-col gap-3">
                    <button
                        onClick={handleReportSubmit}
                        disabled={loading || !type || !description.trim()}
                        className="w-full py-3 rounded-full bg-[#5b42f3] hover:bg-[#4b35d6] text-white font-bold transition-all duration-200 cursor-pointer text-base flex items-center justify-center disabled:opacity-50"
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

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="report-issue-overlay"
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
                        key="report-issue-content"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-sm bg-bg-2 rounded-4xl z-[1010] overflow-hidden"
                    >
                        {renderContent()}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
