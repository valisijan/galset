"use client";

import { useState, useEffect, useRef } from "react";
import Loader from "@/components/Loader";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface EmailModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type View = "EMAIL_INPUT" | "VERIFY_CODE";

export default function EmailModal({ isOpen, onClose }: EmailModalProps) {
    const { refreshUser, sessionToken } = useAuth();
    const [view, setView] = useState<View>("EMAIL_INPUT");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;

        window.history.pushState({ modal: "emailChange" }, "");

        const handlePopState = () => {
            onCloseRef.current();
        };

        window.addEventListener("popstate", handlePopState);
        document.body.classList.add("lock-scroll");

        return () => {
            window.removeEventListener("popstate", handlePopState);
            document.body.classList.remove("lock-scroll");

            if (window.history.state?.modal === "emailChange") {
                window.history.back();
            }
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setView("EMAIL_INPUT");
            setEmail("");
            setCode("");
            setError("");
        }
    }, [isOpen]);

    const handleSendCode = async () => {
        if (!email.trim() || !email.includes("@")) {
            setError("Molimo unesite ispravnu email adresu");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // First check email availability on the backend
            const checkRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/check-availability?email=${encodeURIComponent(email)}`);
            const checkData = await checkRes.json();
            if (!checkRes.ok) {
                throw new Error(checkData.error || "Email adresa je već zauzeta.");
            }

            // Update user email via Supabase Auth
            const { error: sbError } = await supabase.auth.updateUser({ email });
            if (sbError) throw sbError;

            setView("VERIFY_CODE");
        } catch (err: any) {
            setError(err.message || "Greška pri slanju koda");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndSave = async () => {
        if (!code.trim()) {
            setError("Molimo unesite kod");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Verify email change OTP natively via Supabase Auth
            const { error: sbError } = await supabase.auth.verifyOtp({
                email,
                token: code,
                type: "email_change"
            });

            if (sbError) {
                throw new Error(sbError.message === "Token has expired or is invalid" ? "Netačan ili istekao kod za verifikaciju" : sbError.message);
            }

            // Sync email to the backend User table
            const accountRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionToken}`
                },
                body: JSON.stringify({ email }),
            });

            const accountData = await accountRes.json();
            if (!accountRes.ok) throw new Error(accountData.error || "Greška pri čuvanju emaila");

            await refreshUser();
            onClose();
        } catch (err: any) {
            setError(err.message || "Greška pri verifikaciji");
        } finally {
            setLoading(false);
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
                        className="relative bg-bg-2 w-full max-w-[400px] rounded-4xl z-[10100] overflow-hidden"
                    >
                        {/* Centered Header */}
                        <div className="pt-8 pb-1 text-center">
                            <h3 className="text-text-main font-bold text-lg">Promenite email adresu</h3>
                        </div>

                        <div className="p-6">
                            {view === "EMAIL_INPUT" ? (
                                <div className="contents">
                                    <div className="relative mb-6">
                                        <input
                                            type="email"
                                            id="new-email"
                                            required
                                            autoComplete="off"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setError("");
                                            }}
                                            onFocus={() => setIsFocused(true)}
                                            onBlur={() => setIsFocused(false)}
                                            className={`w-full border rounded-full bg-transparent px-5 py-4 text-text-main focus:outline-none transition-colors peer
                                            ${error ? "border-red-500 focus:border-red-500" : "border-bg-4 focus:border-[#6366f1]"}`}
                                        />
                                        <label
                                            htmlFor="new-email"
                                            className={`
                                                absolute left-5 bg-bg-2 px-1 pointer-events-none
                                                transform transition-all
                                                peer-focus:-translate-y-2 peer-focus:text-sm
                                                ${(email.length > 0 || error)
                                                    ? "-translate-y-2 text-sm"
                                                    : "translate-y-4 text-gray-500"}
                                                
                                                ${error
                                                    ? "text-red-500 peer-focus:text-red-500"
                                                    : "peer-focus:text-[#6366f1] text-gray-500"}
                                            `}
                                        >
                                            Nova email adresa
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
                            ) : (
                                <div className="contents">
                                    <p className="text-center text-gray-400 mb-6 text-sm">
                                        Poslali smo vam kod na:
                                        <br />
                                        <span className="text-text-main font-medium">{email}</span>
                                    </p>

                                    <div className="relative mb-6">
                                        <input
                                            type="text"
                                            id="verify-code"
                                            required
                                            autoComplete="off"
                                            value={code}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, "");
                                                if (val.length <= 8) {
                                                    setCode(val);
                                                    setError("");
                                                }
                                            }}
                                            onFocus={() => setIsFocused(true)}
                                            onBlur={() => setIsFocused(false)}
                                            className={`w-full border rounded-full bg-transparent px-5 py-4 text-text-main focus:outline-none transition-colors peer
                                            ${error ? "border-red-500 focus:border-red-500" : "border-bg-4 focus:border-[#6366f1]"}`}
                                        />
                                        <label
                                            htmlFor="verify-code"
                                            className={`
                                                absolute left-5 bg-bg-2 px-1 pointer-events-none
                                                transform transition-all
                                                peer-focus:-translate-y-2 peer-focus:text-sm
                                                ${(code.length > 0 || error)
                                                    ? "-translate-y-2 text-sm"
                                                    : "translate-y-4 text-gray-500"}
                                                
                                                ${error
                                                    ? "text-red-500 peer-focus:text-red-500"
                                                    : "peer-focus:text-[#6366f1] text-gray-500"}
                                            `}
                                        >
                                            Kod
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
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full px-6 pb-6 flex flex-col gap-3">
                            {view === "EMAIL_INPUT" ? (
                                <button
                                    onClick={handleSendCode}
                                    disabled={loading || !email.trim()}
                                    className="w-full py-3 rounded-full bg-[#5b42f3] hover:bg-[#4b35d6] text-white font-bold transition-all duration-200 cursor-pointer text-base flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader /> : "Nastavi"}
                                </button>
                            ) : (
                                <button
                                    onClick={handleVerifyAndSave}
                                    disabled={loading || !code.trim()}
                                    className="w-full py-3 rounded-full bg-[#5b42f3] hover:bg-[#4b35d6] text-white font-bold transition-all duration-200 cursor-pointer text-base flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader /> : "Primeni"}
                                </button>
                            )}
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
