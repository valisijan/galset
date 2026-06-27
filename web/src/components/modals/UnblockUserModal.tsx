import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import Loader from "@/components/Loader";

interface UnblockUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    username: string;
    profileImg?: string | null;
    loading?: boolean;
}

export default function UnblockUserModal({ isOpen, onClose, onConfirm, username, loading }: UnblockUserModalProps) {
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;

        window.history.pushState({ modal: "unblockUser" }, "");

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

            if (window.history.state?.modal === "unblockUser") {
                window.history.back();
            }
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="unblock-user-overlay"
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
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-[400px] bg-bg-2 rounded-4xl z-[1010] overflow-hidden"
                    >
                        {/* Centered Header */}
                        <div className="pt-8 pb-2 text-center">
                            <h3 className="text-text-main font-bold text-lg">Odblokiraj korisnika?</h3>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col items-center text-center mt-2">
                            <div className="mb-8 px-6 w-full text-center">
                                <p className="text-text-main opacity-70 text-[15px]">
                                    Da li ste sigurni da želite da odblokirate korisnika <span className="font-semibold text-text-main">{username}</span>
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="w-full px-6 pb-6 flex flex-col gap-3">
                                <button
                                    onClick={onConfirm}
                                    disabled={loading}
                                    className="w-full py-3 rounded-full bg-[#5b42f3] hover:bg-[#4b35d6] text-white font-bold transition-all duration-200 cursor-pointer text-base flex items-center justify-center disabled:opacity-50"
                                >
                                    {loading ? <Loader /> : "Odblokiraj"}
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
