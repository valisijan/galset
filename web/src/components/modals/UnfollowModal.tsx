import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";

interface UnfollowModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    username?: string;
}

export default function UnfollowModal({ isOpen, onClose, onConfirm, username }: UnfollowModalProps) {
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;

        document.body.classList.add("lock-scroll");
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

        return () => {
            document.body.classList.remove("lock-scroll");
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="unfollow-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-[999999998] flex items-center justify-center p-4"
                >
                    {/* Backdrop */}
                    <div
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-[400px] bg-bg-2 rounded-4xl z-[1010] overflow-hidden"
                    >
                        {/* Centered Header */}
                        <div className="pt-8 pb-2 text-center">
                            <h3 className="text-text-main font-bold text-lg">Prekini praćenje?</h3>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col items-center text-center mt-2">
                            <div className="mb-8 px-6 w-full text-center">
                                <p className="text-[15px] text-text-main">
                                    <span className="opacity-70">Da li ste sigurni da želite da prekinete praćenje korisnika </span>
                                    <span className="font-semibold text-black dark:text-white">{username}</span>
                                    <span className="opacity-70">?</span>
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="w-full px-6 pb-6 flex flex-col gap-3">
                                <button
                                    onClick={onConfirm}
                                    className="w-full py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold transition-all duration-200 cursor-pointer text-base"
                                >
                                    Prekini praćenje
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full py-3 rounded-full bg-bg-4 dark:bg-bg-3 hover:bg-bg-4/80 dark:hover:bg-bg-3/80 text-text-main font-medium transition-all duration-200 cursor-pointer text-base"
                                >
                                    Otkaži
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}