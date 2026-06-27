"use client";

import { useState, useEffect, useRef } from "react";
import Loader from "@/components/Loader";
import { motion, AnimatePresence } from "framer-motion";

interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

function PasswordCheckItem({ isMet, text, showError }: { isMet: boolean; text: string; showError: boolean }) {
    const colorClass = isMet ? "text-[#6366f1]" : showError ? "text-red-500" : "text-text-main";
    const icon = isMet ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    ) : showError ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    ) : (
        <div className="w-1 h-1 rounded-full bg-white ml-1 mr-0.5" />
    );

    return (
        <li className={`flex items-center gap-2 text-[11px] transition-colors duration-300 ${colorClass}`}>
            {icon}
            <span>{text}</span>
        </li>
    );
}

function PasswordField({
    label,
    value,
    onChange,
    error,
    onFocus,
    onBlur,
    isFocused,
    showPasswordHints,
    passwordChecks,
    showPasswordError,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
    onFocus?: () => void;
    onBlur?: () => void;
    isFocused?: boolean;
    showPasswordHints?: boolean;
    passwordChecks?: { length: boolean; hasLetter: boolean; hasNumber: boolean };
    showPasswordError?: boolean;
}) {
    const [show, setShow] = useState(false);
    const active = isFocused || value.length > 0;

    return (
        <div className="relative mb-6">
            <div className="relative">
                <input
                    type={show ? "text" : "password"}
                    required
                    autoComplete="off"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    className={`w-full border rounded-full bg-transparent px-4 py-4 pr-12 text-text-main focus:outline-none peer
                        ${error || showPasswordError
                            ? "border-red-500 focus:border-red-500"
                            : "border-bg-4 focus:border-[#6366f1]"
                        }`}
                />

                <label
                    className={`absolute left-4 pointer-events-none bg-bg-2 px-1 transition-all
                        ${active
                            ? `-top-2 text-sm ${isFocused ? "text-[#6366f1]" : "text-gray-300"}`
                            : "top-1/2 -translate-y-1/2 text-gray-400"
                        }`}
                >
                    {label}
                </label>

                <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-main transition-colors cursor-pointer"
                    tabIndex={-1}
                >
                    {show ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    )}
                </button>
            </div>

            <AnimatePresence>
                {showPasswordHints && passwordChecks && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: "1rem" }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="px-4 overflow-hidden"
                    >
                        <p className={`${showPasswordError ? "text-red-500" : "text-text-main"} text-xs font-medium mb-2 transition-colors duration-300`}>
                            Vaša lozinka mora da sadrži:
                        </p>
                        <ul className="space-y-1.5">
                            <PasswordCheckItem isMet={passwordChecks.length} text="Najmanje 8 znakova" showError={!!showPasswordError} />
                            <PasswordCheckItem isMet={passwordChecks.hasLetter} text="Najmanje jedno slovo" showError={!!showPasswordError} />
                            <PasswordCheckItem isMet={passwordChecks.hasNumber} text="Najmanje jedan broj" showError={!!showPasswordError} />
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && !showPasswordHints && <p className="mt-1.5 ml-4 text-red-400 text-xs">{error}</p>}
        </div>
    );
}

export default function PasswordModal({ isOpen, onClose }: PasswordModalProps) {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [oldError, setOldError] = useState("");
    const [newError, setNewError] = useState("");
    const [isOldFocused, setIsOldFocused] = useState(false);
    const [isNewFocused, setIsNewFocused] = useState(false);
    const [hasBlurredNew, setHasBlurredNew] = useState(false);

    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    const passwordChecks = {
        length: newPassword.length >= 8,
        hasLetter: /[a-zA-Z]/.test(newPassword),
        hasNumber: /[0-9]/.test(newPassword),
    };

    const allMet = passwordChecks.length && passwordChecks.hasLetter && passwordChecks.hasNumber;
    const showPasswordError = (!!newError || (hasBlurredNew && !allMet)) && !allMet;
    const shouldShowHints = isNewFocused || (hasBlurredNew && !allMet);

    useEffect(() => {
        if (!isOpen) {
            setOldPassword("");
            setNewPassword("");
            setError("");
            setOldError("");
            setNewError("");
            setSaving(false);
            setIsOldFocused(false);
            setIsNewFocused(false);
            setHasBlurredNew(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        window.history.pushState({ modal: "passwordChange" }, "");

        const handlePopState = () => {
            onCloseRef.current();
        };

        window.addEventListener("popstate", handlePopState);
        document.body.classList.add("lock-scroll");
        document.documentElement.classList.add("lock-scroll");

        return () => {
            window.removeEventListener("popstate", handlePopState);
            document.body.classList.remove("lock-scroll");
            document.documentElement.classList.remove("lock-scroll");

            if (window.history.state?.modal === "passwordChange") {
                window.history.back();
            }
        };
    }, [isOpen]);


    const handleSubmit = async () => {
        setOldError("");
        setNewError("");
        setError("");

        let valid = true;
        if (!oldPassword) { setOldError("Unesite staru lozinku"); valid = false; }
        if (!newPassword) { setNewError("Unesite novu lozinku"); valid = false; }
        else if (!allMet) { setNewError("Lozinka ne ispunjava uslove"); valid = false; }

        if (!valid) return;

        setSaving(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account/password`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ oldPassword, newPassword }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Greška pri promeni lozinke");

            onClose();
        } catch (err: any) {
            setError(err.message || "Nešto je pošlo po zlu");
        } finally {
            setSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative bg-bg-2 w-full max-w-[400px] rounded-4xl z-[10100] overflow-hidden"
                    >
                        {/* Centered Header */}
                        <div className="pt-8 pb-1 text-center">
                            <h3 className="text-text-main font-bold text-lg">Promenite lozinku</h3>
                        </div>

                        <div className="p-6">
                            <PasswordField
                                label="Unesite staru lozinku"
                                value={oldPassword}
                                isFocused={isOldFocused}
                                onFocus={() => setIsOldFocused(true)}
                                onBlur={() => setIsOldFocused(false)}
                                onChange={(v) => { setOldPassword(v); setOldError(""); setError(""); }}
                                error={oldError}
                            />

                            <PasswordField
                                label="Unesite novu lozinku"
                                value={newPassword}
                                isFocused={isNewFocused}
                                onFocus={() => setIsNewFocused(true)}
                                onBlur={() => {
                                    setIsNewFocused(false);
                                    if (newPassword.length > 0) setHasBlurredNew(true);
                                }}
                                passwordChecks={passwordChecks}
                                showPasswordHints={shouldShowHints}
                                showPasswordError={showPasswordError}
                                onChange={(v) => { setNewPassword(v); setNewError(""); setError(""); }}
                                error={newError}
                            />

                            {error && (
                                <div className="flex items-center gap-2 mb-4 ml-1">
                                    <div className="w-5 h-5 min-w-[20px] rounded-full bg-red-600 flex items-center justify-center text-text-main text-[10px] font-bold">
                                        !
                                    </div>
                                    <span className="text-xs text-red-400">{error}</span>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full px-6 pb-6 flex flex-col gap-3">
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="w-full py-3 rounded-full bg-[#5b42f3] hover:bg-[#4b35d6] text-white font-bold transition-all duration-200 cursor-pointer text-base flex justify-center items-center disabled:opacity-50"
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
