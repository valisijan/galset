"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import ImageModal from "./ImageModal";
import Loader from "@/components/Loader";
import Avatar from "@/components/Avatar";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import Link from "next/link";

export default function ProfileSettingsPage() {
    const { user, refreshUser } = useAuth();
    const [showImageModal, setShowImageModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [usernameStatus, setUsernameStatus] = useState<"idle" | "loading" | "available" | "taken">("idle");

    const [form, setForm] = useState({
        fullName: "",
        username: "",
        country: "",
        city: "",
        address: "",
        description: "",
    });

    const [initialForm, setInitialForm] = useState({
        fullName: "",
        username: "",
        country: "",
        city: "",
        address: "",
        description: "",
    });

    useEffect(() => {
        if (user) {
            const u = user as any;
            const userData = {
                fullName: u.fullName || u.name || "",
                username: u.username || "",
                country: u.country || u.location || "",
                city: u.city || "",
                address: u.address || "",
                description: u.description || u.bio || "",
            };
            setForm(userData);
            setInitialForm(userData);
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    useEffect(() => {
        if (!form.username || form.username === initialForm.username || form.username.length < 3) {
            setUsernameStatus("idle");
            return;
        }

        const timer = setTimeout(async () => {
            setUsernameStatus("loading");
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/check-username`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: form.username }),
                });
                if (!res.ok) {
                    setUsernameStatus("idle");
                    return;
                }
                const data = await res.json();
                setUsernameStatus(data.available ? "available" : "taken");
            } catch (err) {
                setUsernameStatus("idle");
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [form.username, initialForm.username]);

    const handleCancel = () => {
        setForm({ ...initialForm });
    };

    const handleSave = async () => {
        const newErrors: { [key: string]: string } = {};

        if (!form.username.trim()) {
            newErrors.username = "Molimo unesite korisničko ime";
        } else if (form.username.length < 3) {
            newErrors.username = "Korisničko ime mora da sadrži najmanje 3 karaktera";
        } else if (!/[a-zA-Z]/.test(form.username)) {
            newErrors.username = "Korisničko ime mora da sadrži najmanje jedno slovo";
        } else if (usernameStatus === "taken") {
            newErrors.username = "Korisničko ime je zauzeto";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setError("Molimo ispravite greške u poljima");
            return;
        }

        setErrors({});
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fullName: form.fullName,
                    username: form.username,
                    country: form.country,
                    city: form.city,
                    address: form.address,
                    description: form.description,
                    birthDate: (user as any)?.birthDate || "",
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Greška pri čuvanju");
            }

            setSuccess(true);
            await refreshUser();

            setTimeout(() => {
                setInitialForm({ ...form });
                setSuccess(false);
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Nešto je pošlo po zlu");
        } finally {
            setSaving(false);
        }
    };

    const isUsernameShort = form.username.length > 0 && form.username.length < 3;
    const usernameError = errors.username || 
        (isUsernameShort ? "Korisničko ime mora da sadrži najmanje 3 karaktera" : 
         usernameStatus === "taken" ? "Korisničko ime je zauzeto" : undefined);

    const hasChanges = JSON.stringify(form) !== JSON.stringify(initialForm);
    const gradientBtn = "transition-all duration-[350ms] linear bg-[#5b42f3] hover:bg-[#4b35d6]";

    return (
        <div className="w-full relative pb-20">
            <h1 className="text-text-main text-xl sm:text-2xl font-bold mt-4 mb-8 text-center">Uredi profil</h1>

            {/* AVATAR BOX */}
            <div className="bg-bg-2 border border-bg-3 rounded-3xl p-4 mb-8 flex items-center justify-between gap-4 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="relative cursor-pointer shrink-0" onClick={() => setShowImageModal(true)}>
                        <Avatar
                            name={user?.username || user?.fullName}
                            email={user?.email}
                            imageUrl={user?.profileImg}
                            size={60}
                        />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-text-main font-bold text-lg leading-tight truncate">{form.fullName || (user as any)?.fullName}</span>
                        <span className="text-gray-400 text-sm truncate">@{form.username || user?.username}</span>
                    </div>
                </div>

                <button
                    onClick={() => setShowImageModal(true)}
                    className="bg-[#5b42f3] hover:bg-[#4b35d6] text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer shrink-0"
                >
                    Izmeni sliku
                </button>
            </div>

            {/* JAVNI PODACI */}
            <Section title="Javni podaci">
                <FloatingInput label="Puno ime" name="fullName" value={form.fullName} onChange={handleChange} />
                <FloatingInput
                    label="Korisničko ime"
                    name="username"
                    value={form.username}
                    error={usernameError}
                    rightElement={
                        <div className="flex items-center">
                            {usernameStatus === "loading" && (
                                <div className="scale-50">
                                    <Loader />
                                </div>
                            )}
                            {usernameStatus === "available" && (
                                <Check className="text-green-500" size={20} />
                            )}
                            {usernameStatus === "taken" && (
                                <X className="text-red-500" size={20} />
                            )}
                        </div>
                    }
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val.length > 30) return;
                        const regex = /^[a-zA-Z0-9._-]*$/;
                        if (regex.test(val)) handleChange(e);
                    }}
                />
                <CountrySelect
                    value={form.country}
                    onChange={(val) => setForm(p => ({ ...p, country: val, city: "" }))}
                />
                <CityAutocomplete
                    value={form.city}
                    country={form.country}
                    onChange={(val) => setForm(p => ({ ...p, city: val }))}
                />
                <FloatingInput label="Adresa" name="address" value={form.address} onChange={handleChange} />
                <FloatingInput
                    label="Opis profila"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    maxLength={150}
                    showCounter={true}
                    roundedClassName="rounded-3xl"
                    multiline={true}
                />
            </Section>

            {/* FLOATING SAVE BAR */}
            <AnimatePresence>
                {(hasChanges || success) && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-20 md:bottom-10 inset-x-0 mx-auto w-[95%] md:w-[90%] max-w-[550px] bg-bg-2 px-4 md:px-6 py-4 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 shadow-2xl z-[100] border border-bg-3"
                    >
                        <div className="flex-1 text-center md:text-left">
                            <p className="text-text-main text-sm md:text-base font-medium">
                                {success ? "Izmene su sačuvane" : "Imate nesačuvane izmene"}
                            </p>
                            {error && <p className="text-red-400 text-[10px] md:text-xs mt-1">{error}</p>}
                        </div>

                        {!success && (
                            <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto justify-center md:justify-end">
                                <button
                                    onClick={handleCancel}
                                    className="text-text-main text-xs md:text-sm font-semibold bg-bg-3 hover:bg-bg-4 px-4 md:px-5 py-2 md:py-2.5 rounded-full cursor-pointer transition-colors"
                                >
                                    Otkaži
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className={`text-white px-6 md:px-8 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold flex items-center justify-center min-w-[100px] md:min-w-[120px] cursor-pointer ${gradientBtn}`}
                                >
                                    {saving ? (
                                        <div className="scale-50 h-6 flex items-center justify-center">
                                            <Loader />
                                        </div>
                                    ) : (
                                        "Sačuvaj"
                                    )}
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <ImageModal
                isOpen={showImageModal}
                onClose={() => setShowImageModal(false)}
            />
        </div>
    );
}

function Section({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="mb-14">
            <div className="flex items-center gap-2 mb-6">
                <h2 className="text-xl font-bold md:hidden">{title}</h2>
                {subtitle && <span className="text-sm text-gray-500 md:hidden">({subtitle})</span>}
            </div>
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
    rightIcon,
    rightElement,
    readOnly,
    error,
    maxLength,
    showCounter,
    roundedClassName = "rounded-full",
    multiline = false,
}: {
    label: string;
    name: string;
    value: string;
    type?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    rightIcon?: React.ReactNode;
    rightElement?: React.ReactNode;
    readOnly?: boolean;
    error?: string;
    maxLength?: number;
    showCounter?: boolean;
    roundedClassName?: string;
    multiline?: boolean;
}) {
    const [isFocused, setIsFocused] = useState(false);
    const active = isFocused || (value && value.length > 0) || type === "date";

    const commonProps = {
        name,
        value,
        readOnly,
        onChange,
        onFocus: () => setIsFocused(true),
        onBlur: () => setIsFocused(false),
        maxLength,
        className: `w-full bg-transparent border px-4 py-4 text-text-main focus:outline-none transition-all ${roundedClassName}
            ${error ? "border-red-500" : isFocused ? "border-[#6366f1]" : "border-bg-4"}
            ${readOnly ? "opacity-70 pointer-events-none" : ""} 
            ${rightElement ? "pr-16 md:pr-6" : ""}
            ${multiline ? "resize-none min-h-[150px] custom-modal-scrollbar" : ""}`
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="relative flex items-center">
                <div className={`relative flex-1 ${readOnly ? "cursor-not-allowed" : ""}`}>
                    {multiline ? (
                        <textarea {...commonProps} />
                    ) : (
                        <input type={type} {...commonProps} />
                    )}

                    <label
                        className={`absolute left-4 transition-all pointer-events-none bg-bg-1 px-1
                            ${active
                                ? `-top-2 text-sm ${error ? "text-red-500" : isFocused ? "text-[#6366f1]" : "text-gray-500 dark:text-gray-400"}`
                                : `${multiline ? "top-4" : "top-1/2 -translate-y-1/2"} text-gray-400`
                            }`}
                    >
                        {label}
                    </label>

                    {rightIcon && !multiline && (
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400">
                            {rightIcon}
                        </div>
                    )}

                    {rightElement && !multiline && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                            {rightElement}
                        </div>
                    )}

                    {showCounter && maxLength && multiline && (
                        // counter is now rendered below the field, not here
                        null
                    )}
                    {showCounter && maxLength && !multiline && (
                        <div className="absolute right-4 bottom-2 text-[10px] text-gray-500 pointer-events-none">
                            {value ? value.length : 0}/{maxLength}
                        </div>
                    )}
                </div>
            </div>
            {showCounter && maxLength && multiline && (
                <div className="text-xs text-gray-500 text-right mt-1 mr-1">
                    {value ? value.length : 0}/{maxLength}
                </div>
            )}
            {error && (
                <div className="flex items-center gap-2 mt-1 ml-4">
                    <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-text-main text-xs font-bold shrink-0">
                        !
                    </div>
                    <span className="text-sm text-red-400">{error}</span>
                </div>
            )}
        </div>
    );
}

function CountrySelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (val: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [locationsData, setLocationsData] = useState<Record<string, string[]>>({});
    const ref = useRef<HTMLDivElement>(null);
    const countries = Object.keys(locationsData);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/data/locations.json`)
            .then(r => r.json())
            .then(data => setLocationsData(data || {}))
            .catch(() => setLocationsData({}));
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={`w-full min-h-[56px] bg-transparent border rounded-full px-4 py-4 text-left focus:outline-none transition-colors ${open ? "border-[#6366f1]" : "border-bg-4"
                    }`}
            >
                <span className={value ? "text-text-main" : "text-gray-400"}>
                    {value || ""}
                </span>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
            </button>

            <label
                className={`absolute left-4 pointer-events-none bg-bg-1 px-1 transition-all ${value || open
                    ? `-top-2 text-sm ${open ? "text-[#6366f1]" : "text-gray-500 dark:text-gray-400"}`
                    : "top-1/2 -translate-y-1/2 text-gray-400"
                    }`}
            >
                Država
            </label>

            <AnimatePresence>
                {open && (
                    <motion.ul
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 mt-2 w-full bg-bg-1 border border-bg-3 rounded-3xl overflow-y-auto max-h-56 shadow-xl p-2
                            custom-modal-scrollbar"
                    >
                        {countries.map((country) => (
                            <li
                                key={country}
                                onMouseDown={() => {
                                    onChange(country);
                                    setOpen(false);
                                }}
                                className={`px-4 py-2.5 rounded-2xl cursor-pointer text-sm transition-colors ${value === country
                                    ? "text-[#6366f1] font-semibold bg-[#6366f1]/10"
                                    : "text-text-main hover:bg-bg-4"
                                    }`}
                            >
                                {country}
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}

function CityAutocomplete({
    value,
    country,
    onChange,
}: {
    value: string;
    country: string;
    onChange: (val: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState(value);
    const [locationsData, setLocationsData] = useState<Record<string, string[]>>({});
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/data/locations.json`)
            .then(r => r.json())
            .then(data => setLocationsData(data || {}))
            .catch(() => setLocationsData({}));
    }, []);

    useEffect(() => {
        setQuery(value);
    }, [value]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setQuery(value);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [value]);

    const cities: string[] = country
        ? (locationsData as Record<string, string[]>)[country] ?? []
        : [];

    const filtered = query.length > 0
        ? cities.filter(c => c.toLowerCase().includes(query.toLowerCase()))
        : [];

    const isFocused = open;
    const active = isFocused || query.length > 0;

    return (
        <div ref={ref} className="relative">
            <input
                type="text"
                value={query}
                disabled={!country}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => { }}
                placeholder=""
                className={`w-full bg-transparent border rounded-full px-4 py-4 text-text-main focus:outline-none transition-colors ${isFocused ? "border-[#6366f1]" : "border-bg-4"
                    } ${!country ? "opacity-40 cursor-not-allowed" : ""}`}
            />

            <label
                className={`absolute left-4 pointer-events-none bg-bg-1 px-1 transition-all ${active
                    ? `-top-2 text-sm ${isFocused ? "text-[#6366f1]" : "text-gray-500 dark:text-gray-400"}`
                    : "top-1/2 -translate-y-1/2 text-gray-400"
                    }`}
            >
                Grad
            </label>

            <AnimatePresence>
                {open && filtered.length > 0 && (
                    <motion.ul
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 mt-2 w-full bg-bg-1 border border-bg-3 rounded-3xl overflow-y-auto max-h-56 shadow-xl p-2
                            custom-modal-scrollbar"
                    >
                        {filtered.map((city) => (
                            <li
                                key={city}
                                onMouseDown={() => {
                                    onChange(city);
                                    setQuery(city);
                                    setOpen(false);
                                }}
                                className={`px-4 py-2.5 rounded-2xl cursor-pointer text-sm transition-colors ${value === city
                                    ? "text-[#6366f1] font-semibold bg-[#6366f1]/10"
                                    : "text-text-main hover:bg-bg-4"
                                    }`}
                            >
                                {city}
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}
