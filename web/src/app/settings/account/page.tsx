"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import EmailModal from "./EmailModal";
import PhoneModal from "./PhoneModal";
import Loader from "@/components/Loader";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Pen, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import BirthModal from "./BirthModal";

const MONTHS = [
    "Januar", "Februar", "Mart", "April", "Maj", "Jun",
    "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"
];

export default function AccountSettingsPage() {
    const { user } = useAuth();
    const [showBirthModal, setShowBirthModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [form, setForm] = useState({
        email: "",
        phone: "",
        birthDate: "",
        birthDay: "",
        birthMonth: "",
        birthYear: "",
    });

    const [initialForm, setInitialForm] = useState({
        birthDate: "",
        birthDay: "",
        birthMonth: "",
        birthYear: "",
    });

    useEffect(() => {
        if (user) {
            const u = user as any;

            let formattedDate = "";
            if (u.birthDate) {
                const dateStr = String(u.birthDate);
                formattedDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr.substring(0, 10);
            }

            let bDay = "";
            let bMonth = "";
            let bYear = "";
            if (formattedDate) {
                const parts = formattedDate.split("-");
                if (parts.length === 3) {
                    bYear = parts[0];
                    bMonth = MONTHS[parseInt(parts[1], 10) - 1] || "";
                    bDay = parseInt(parts[2], 10).toString();
                }
            }

            const userData = {
                email: u.email || "",
                phone: u.phone || "",
                birthDate: formattedDate,
                birthDay: bDay,
                birthMonth: bMonth,
                birthYear: bYear,
            };
            setForm(userData);

            setInitialForm({
                birthDate: userData.birthDate,
                birthDay: userData.birthDay,
                birthMonth: userData.birthMonth,
                birthYear: userData.birthYear,
            });
        }
    }, [user]);

    const handleDateChange = (name: "birthDay" | "birthMonth" | "birthYear", value: string) => {
        const newForm = { ...form, [name]: value };

        if (newForm.birthYear && newForm.birthMonth && newForm.birthDay) {
            const mIdx = MONTHS.indexOf(newForm.birthMonth) + 1;
            const mStr = mIdx < 10 ? `0${mIdx}` : `${mIdx}`;
            const dStr = Number(newForm.birthDay) < 10 ? `0${newForm.birthDay}` : `${newForm.birthDay}`;
            newForm.birthDate = `${newForm.birthYear}-${mStr}-${dStr}`;
        } else {
            newForm.birthDate = "";
        }

        setForm(newForm);
    };

    const handleCancel = () => {
        setForm(prev => ({
            ...prev,
            ...initialForm
        }));
    };

    const gradientBtn = "transition-all duration-[350ms] linear bg-[#5b42f3] hover:bg-[#4b35d6]";

    const hasChanges =
        form.birthDate !== initialForm.birthDate ||
        form.birthDay !== initialForm.birthDay ||
        form.birthMonth !== initialForm.birthMonth ||
        form.birthYear !== initialForm.birthYear;

    return (
        <div className="w-full relative pb-20">
            <h1 className="text-2xl font-bold text-text-main mb-8">Lični podaci</h1>

            <Section>
                {/* Birthday Card */}
                <button
                    onClick={() => setShowBirthModal(true)}
                    className="flex items-center justify-between w-full px-6 py-4 rounded-full bg-bg-2 border border-bg-3 cursor-pointer transition-all duration-200 hover:bg-bg-3 mb-4"
                >
                    <span className="text-text-main font-medium text-sm">Rođendan</span>
                    <div className="flex items-center gap-2">
                        {form.birthDate ? (
                            <span className="text-gray-400 font-medium text-sm">
                                {form.birthMonth} {form.birthDay}, {form.birthYear}
                            </span>
                        ) : (
                            <span className="text-gray-500 font-medium text-sm">Nema</span>
                        )}
                        <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
                    </div>
                </button>

                {/* Email Card */}
                <button
                    onClick={() => setShowEmailModal(true)}
                    className="flex items-center justify-between w-full px-6 py-4 rounded-full bg-bg-2 border border-bg-3 cursor-pointer transition-all duration-200 hover:bg-bg-3 mb-4"
                >
                    <span className="text-text-main font-medium text-sm">Email adresa</span>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-medium text-sm">{form.email}</span>
                        <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
                    </div>
                </button>

                {/* Phone Card */}
                <button
                    onClick={() => setShowPhoneModal(true)}
                    className="flex items-center justify-between w-full px-6 py-4 rounded-full bg-bg-2 border border-bg-3 cursor-pointer transition-all duration-200 hover:bg-bg-3"
                >
                    <span className="text-text-main font-medium text-sm">Broj telefona</span>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-medium text-sm">{form.phone || "Nema"}</span>
                        <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
                    </div>
                </button>
            </Section>

            {/* FLOATING SAVE BAR REMOVED */}

            <BirthModal
                isOpen={showBirthModal}
                onClose={() => setShowBirthModal(false)}
                initialDate={form.birthDate}
                onSave={(newDate) => {
                    const parts = newDate ? newDate.split("-") : ["", "", ""];
                    setForm(p => ({
                        ...p,
                        birthDate: newDate,
                        birthYear: parts[0] || "",
                        birthMonth: parts[1] ? (MONTHS[parseInt(parts[1], 10) - 1] || "") : "",
                        birthDay: parts[2] ? parseInt(parts[2], 10).toString() : "",
                    }));
                    setShowBirthModal(false);
                }}
            />

            <EmailModal
                isOpen={showEmailModal}
                onClose={() => setShowEmailModal(false)}
            />

            <PhoneModal
                isOpen={showPhoneModal}
                onClose={() => setShowPhoneModal(false)}
                initialValue={form.phone}
                onSuccess={(newPhone) => setForm(p => ({ ...p, phone: newPhone }))}
            />
        </div>
    );
}

function Section({ children, title }: { children: React.ReactNode; title?: string }) {
    return (
        <section className="mb-14">
            {title && (
                <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-xl font-bold md:hidden">{title}</h2>
                </div>
            )}
            <div className="space-y-6">{children}</div>
        </section>
    );
}

function FloatingInput({
    label,
    name,
    value,
    type = "text",
    onChange,
    rightElement,
    readOnly,
}: {
    label: string;
    name: string;
    value: string;
    type?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    rightElement?: React.ReactNode;
    readOnly?: boolean;
}) {
    const [isFocused, setIsFocused] = useState(false);
    const active = isFocused || (value && value.length > 0) || type === "date";

    return (
        <div className="flex flex-col gap-2">
            <div className="relative flex items-center">
                <div className={`relative flex-1 ${readOnly ? "cursor-not-allowed opacity-70 pointer-events-none" : ""}`}>
                    <input
                        type={type}
                        name={name}
                        value={value}
                        readOnly={readOnly}
                        onChange={onChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className={`w-full bg-transparent border px-4 py-4 text-text-main focus:outline-none transition-all rounded-full border-bg-4 ${rightElement ? "pr-16 md:pr-40" : ""}`}
                    />

                    <label
                        className={`absolute left-4 transition-all pointer-events-none bg-bg-1 px-1
                            ${active
                                ? `-top-2 text-sm text-gray-300`
                                : `top-1/2 -translate-y-1/2 text-gray-400`
                            }`}
                    >
                        {label}
                    </label>

                    {rightElement && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
                            {rightElement}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CustomSelect({
    label,
    value,
    options,
    onChange,
    error,
}: {
    label: string;
    value: string;
    options: (string | number)[];
    onChange: (val: string) => void;
    error?: string;
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
        <div className="relative flex-1" ref={containerRef}>
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen((prev) => !prev);
                }}
                className={`w-full border rounded-full bg-transparent px-4 py-4 text-text-main focus:outline-none cursor-pointer flex justify-between items-center transition-colors duration-200
          ${error ? "border-red-500" : isOpen ? "border-[#6366f1]" : "border-bg-4"}`}
            >
                <span className="truncate">
                    {value || "\u00A0"}
                </span>
                <ChevronDown size={18} className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </div>

            <label
                className={`absolute left-4 pointer-events-none bg-bg-1 px-1 transition-all duration-200
          ${isOpen || value && value !== "\u00A0"
                        ? "top-0 -translate-y-2 text-sm text-[#6366f1]"
                        : "top-1/2 -translate-y-1/2 text-gray-400 text-sm"}
          ${error ? "!text-red-500" : !isOpen && value && value !== "\u00A0" ? "!text-gray-300" : ""}`}
            >
                {label}
            </label>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-bg-2 border border-bg-4 rounded-3xl py-2 shadow-2xl
                            custom-modal-scrollbar"
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
