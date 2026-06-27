import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "@/components/Loader";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const MONTHS = [
    "Januar", "Februar", "Mart", "April", "Maj", "Jun",
    "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"
];

interface BirthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialDate: string;
    onSave: (newDate: string) => void;
}

export default function BirthModal({ isOpen, onClose, initialDate, onSave }: BirthModalProps) {
    const [birthDay, setBirthDay] = useState("");
    const [birthMonth, setBirthMonth] = useState("");
    const [birthYear, setBirthYear] = useState("");

    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;

        window.history.pushState({ modal: "birthDate" }, "");

        const handlePopState = () => {
            onCloseRef.current();
        };

        window.addEventListener("popstate", handlePopState);
        document.body.classList.add("lock-scroll");

        return () => {
            window.removeEventListener("popstate", handlePopState);
            document.body.classList.remove("lock-scroll");

            if (window.history.state?.modal === "birthDate") {
                window.history.back();
            }
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            if (initialDate) {
                const parts = initialDate.split("-");
                if (parts.length === 3) {
                    setBirthYear(parts[0]);
                    setBirthMonth(MONTHS[parseInt(parts[1], 10) - 1] || "");
                    setBirthDay(parseInt(parts[2], 10).toString());
                }
            } else {
                setBirthDay("");
                setBirthMonth("");
                setBirthYear("");
            }
        }
    }, [isOpen, initialDate]);

    const { refreshUser } = useAuth();
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        let finalDate = "";
        if (birthYear && birthMonth && birthDay) {
            const mIdx = MONTHS.indexOf(birthMonth) + 1;
            const mStr = mIdx < 10 ? `0${mIdx}` : `${mIdx}`;
            const dStr = Number(birthDay) < 10 ? `0${birthDay}` : `${birthDay}`;
            finalDate = `${birthYear}-${mStr}-${dStr}`;
        }

        setSaving(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ birthDate: finalDate }),
            });

            if (!res.ok) throw new Error("Došlo je do greške pri čuvanju.");

            await refreshUser();
            onSave(finalDate);
            toast.success("Datum rođenja je sačuvan.");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Nešto je pošlo po zlu.");
        } finally {
            setSaving(false);
        }
    };

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
                        className="relative bg-bg-2 w-full max-w-[400px] rounded-4xl overflow-visible"
                    >
                        {/* Centered Header */}
                        <div className="pt-8 pb-1 text-center">
                            <h3 className="text-text-main font-bold text-lg">Izmenite datum rođendana</h3>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-8 flex flex-col gap-8">
                            <div className="flex gap-3 relative z-10">
                                <div className="flex-[1.3] relative z-[50]">
                                    <CustomSelect
                                        label="Mesec"
                                        value={birthMonth}
                                        options={MONTHS}
                                        onChange={setBirthMonth}
                                    />
                                </div>
                                <div className="flex-[0.9] relative z-[40]">
                                    <CustomSelect
                                        label="Dan"
                                        value={birthDay}
                                        options={Array.from({ length: 31 }, (_, i) => i + 1)}
                                        onChange={setBirthDay}
                                    />
                                </div>
                                <div className="flex-[1.2] relative z-[30]">
                                    <CustomSelect
                                        label="Godina"
                                        value={birthYear}
                                        options={Array.from({ length: 2026 - 1900 + 1 }, (_, i) => 2026 - i)}
                                        onChange={setBirthYear}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full px-6 pb-6 flex flex-col gap-3">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full py-3 rounded-full bg-[#5b42f3] hover:bg-[#4b35d6] text-white font-bold transition-all duration-200 cursor-pointer text-base flex items-center justify-center disabled:opacity-50"
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

function CustomSelect({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: (string | number)[];
    onChange: (val: string) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (opt: string | number, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(String(opt));
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen((prev) => !prev);
                }}
                className={`w-full border rounded-full bg-transparent px-4 py-4 text-text-main focus:outline-none cursor-pointer flex justify-between items-center transition-colors duration-200
          ${isOpen ? "border-[#6366f1]" : "border-bg-4"}`}
            >
                <span className="truncate">
                    {value || "\u00A0"}
                </span>
                <ChevronDown size={18} className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </div>

            <label
                className={`absolute left-4 pointer-events-none bg-bg-2 px-1 transition-all duration-200
          ${isOpen || value && value !== "\u00A0"
                        ? "top-0 -translate-y-2 text-sm text-[#6366f1]"
                        : "top-1/2 -translate-y-1/2 text-gray-400 text-sm"}
          ${!isOpen && value && value !== "\u00A0" ? "!text-gray-300" : ""}`}
            >
                {label}
            </label>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-bg-2 border border-bg-4 rounded-3xl py-2 shadow-2xl custom-modal-scrollbar"
                    >
                        {options.map((opt) => (
                            <div
                                key={opt}
                                onClick={(e) => handleSelect(opt, e)}
                                className="px-4 py-3 hover:bg-bg-4 cursor-pointer text-text-main text-sm transition-colors font-medium"
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                {opt}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
