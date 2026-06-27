"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import StarRating from "./StarRating";
import { addReview } from "@/actions/review";
import Loader from "@/components/Loader";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetUserId: number;
}

export default function ReviewModal({ isOpen, onClose, targetUserId }: ReviewModalProps) {
    const [mounted, setMounted] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;

        window.history.pushState({ modal: "review" }, "");

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

            if (window.history.state?.modal === "review") {
                window.history.back();
            }
        };
    }, [isOpen]);

    const handleSubmit = async () => {
        if (rating === 0) {
            setError("Morate izabrati ocenu.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await addReview(targetUserId, rating, comment);
            if (res.success) {
                onClose();
                setRating(0);
                setComment("");
            } else {
                setError(res.message || "Došlo je do greške.");
            }
        } catch (err) {
            setError("Došlo je do greške.");
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    {/* BACKDROP */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80"
                    />

                    {/* MODAL */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-[420px] bg-bg-2 rounded-3xl z-[10100] shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Centered Header */}
                        <div className="pt-8 pb-2 text-center">
                            <h3 className="text-text-main font-bold text-lg">Oceni korisnika</h3>
                        </div>

                        <div className="flex flex-col items-center text-center mt-4">
                            {/* Stars Section */}
                            <div className="px-6 w-full flex justify-center mb-6">
                                <StarRating
                                    rating={rating}
                                    interactive={true}
                                    onRate={setRating}
                                    size={36}
                                />
                            </div>

                            {/* Comment Section */}
                            <div className="px-6 w-full mb-8">
                                <div className="relative w-full">
                                    <textarea
                                        value={comment}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 500) {
                                                setComment(e.target.value);
                                            }
                                        }}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setIsFocused(false)}
                                        className={`w-full bg-transparent text-text-main rounded-3xl px-4 py-4 outline-none border transition-all min-h-[150px] resize-none text-[15px] custom-modal-scrollbar ${isFocused ? "border-[#6366f1]" : "border-bg-3"}`}
                                    />
                                    <label
                                        className={`absolute left-4 transition-all pointer-events-none bg-bg-2 px-1
                                            ${(isFocused || comment.length > 0)
                                                ? `-top-2 text-sm ${isFocused ? "text-[#6366f1]" : "text-gray-300"}`
                                                : `top-4 text-gray-400`
                                            }`}
                                        >
                                            Opis
                                        </label>
                                    {comment.length > 0 && (
                                        <p className="text-xs text-gray-500 text-right mt-1">{comment.length}/500</p>
                                    )}
                                    {error && (
                                        <div className="flex items-center gap-2 mt-4 text-left">
                                            <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-text-main text-xs font-bold shrink-0">
                                                !
                                            </div>
                                            <span className="text-sm text-red-400 font-medium">{error}</span>
                                        </div>
                                    )}
                                </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="w-full px-6 pb-6 flex flex-col gap-3">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading || rating === 0}
                                        className="w-full py-3 rounded-full bg-[#5b42f3] hover:bg-[#4b35d6] text-white font-bold transition-all duration-200 cursor-pointer text-base flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <Loader /> : "Oceni"}
                                    </button>
                                    <button
                                        onClick={onClose}
                                        disabled={loading}
                                        className="w-full py-3 rounded-full bg-bg-4 dark:bg-bg-3 hover:bg-bg-4/80 dark:hover:bg-bg-3/80 text-text-main font-medium transition-all duration-200 cursor-pointer text-base"
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
    );
}
