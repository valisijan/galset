import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import AboutUserModal from "./AboutUserModal";
import ReportUserModal from "./ReportUserModal";
import Loader from "@/components/Loader";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
const UserAvatar = "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/assets/user-avatar.png";

interface UserMoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    isBlocked: boolean;
    onShare: () => void;
    onBlockConfirm: () => void;
    blockLoading?: boolean;
    isOwnProfile?: boolean;
    onReview?: () => void;
}

export default function UserMoreModal({ isOpen, onClose, user, isBlocked, onShare, onBlockConfirm, blockLoading, isOwnProfile, onReview }: UserMoreModalProps) {
    const [view, setView] = useState<"menu" | "about" | "report" | "block">("menu");
    const { user: currentUser } = useAuth();
    const router = useRouter();

    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;

        window.history.pushState({ modal: "user_more" }, "");

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

            setTimeout(() => {
                if (window.history.state?.modal === "user_more") {
                    window.history.back();
                }
            }, 0);
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => setView("menu"), 300);
        }
    }, [isOpen]);

    const joinedDate = user?.createdAt ? new Date(user.createdAt) : new Date();
    const monthNames = ["januar", "februar", "mart", "april", "maj", "jun", "jul", "avgust", "septembar", "oktobar", "novembar", "decembar"];
    const formattedJoinedDate = `${monthNames[joinedDate.getMonth()]} ${joinedDate.getFullYear()}`;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="user-more-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-[99999] flex items-center justify-center px-4"
                >
                    <div
                        className="absolute inset-0 bg-black/80"
                        onClick={onClose}
                    />
                    <AnimatePresence mode="wait">
                        {view === "menu" ? (
                            <motion.div
                                key="menu"
                                initial={{ opacity: 0, scale: 0.92, y: 8 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92, y: 8 }}
                                transition={{ duration: 0.18, ease: "easeOut" }}
                                className="relative bg-bg-2 w-full max-w-sm rounded-4xl overflow-hidden"
                            >
                                {/* MENU VIEW */}
                                <div className="w-full flex flex-col px-6 py-6 gap-3">
                                    <button
                                        onClick={() => { onShare(); onClose(); }}
                                        className="w-full py-3 rounded-full bg-[#5b42f3] hover:bg-[#4b35d6] text-white font-bold transition-all duration-200 cursor-pointer text-base flex justify-center items-center"
                                    >
                                        Podeli
                                    </button>
                                    {!isOwnProfile && (
                                        <button
                                            onClick={() => {
                                                onClose();
                                                if (onReview) {
                                                    onReview();
                                                } else {
                                                    setTimeout(() => {
                                                        router.push(`/${user?.username}/reviews?action=review`);
                                                    }, 150);
                                                }
                                            }}
                                            className="w-full py-3 rounded-full bg-[#5b42f3] hover:bg-[#4b35d6] text-white font-bold transition-all duration-200 cursor-pointer text-base flex justify-center items-center"
                                        >
                                            Oceni
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setView("about")}
                                        className="w-full py-3 rounded-full bg-[#5b42f3] hover:bg-[#4b35d6] text-white font-bold transition-all duration-200 cursor-pointer text-base flex justify-center items-center"
                                    >
                                        O ovom nalogu
                                    </button>
                                    {!isOwnProfile && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    if (!currentUser) {
                                                        onClose();
                                                        window.dispatchEvent(new Event("open-auth-modal"));
                                                    } else {
                                                        setView("block");
                                                    }
                                                }}
                                                className="w-full py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold transition-all duration-200 cursor-pointer text-base flex justify-center items-center"
                                            >
                                                {isBlocked ? "Odblokiraj" : "Blokiraj"}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (!currentUser) {
                                                        onClose();
                                                        window.dispatchEvent(new Event("open-auth-modal"));
                                                    } else {
                                                        setView("report");
                                                    }
                                                }}
                                                className="w-full py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold transition-all duration-200 cursor-pointer text-base flex justify-center items-center"
                                            >
                                                Prijavi korisnika
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={onClose}
                                        className="w-full py-3 rounded-full bg-bg-4 dark:bg-bg-3 hover:bg-bg-4/80 dark:hover:bg-bg-3/80 text-text-main font-medium transition-all duration-200 cursor-pointer text-base flex justify-center items-center"
                                    >
                                        Otkaži
                                    </button>
                                </div>
                            </motion.div>
                        ) : view === "about" ? (
                            <AboutUserModal 
                                isOpen={isOpen}
                                onClose={onClose}
                                onBack={() => setView("menu")}
                                user={user}
                            />
                        ) : view === "report" ? (
                            <ReportUserModal
                                isOpen={isOpen}
                                onClose={onClose}
                                onBack={() => setView("menu")}
                                username={user?.username || ""}
                                profileImg={user?.profileImg}
                                targetId={user?.id}
                            />
                        ) : (
                            <motion.div
                                key="block"
                                initial={{ opacity: 0, scale: 0.92, y: 8 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92, y: 8 }}
                                transition={{ duration: 0.18, ease: "easeOut" }}
                                className="relative bg-bg-2 w-full max-w-sm rounded-4xl overflow-hidden"
                            >
                                {/* Centered Header */}
                                <div className="pt-8 pb-2 text-center">
                                    <h3 className="text-text-main font-bold text-lg">
                                        {isBlocked ? "Odblokiraj korisnika?" : "Blokiraj korisnika?"}
                                    </h3>
                                </div>

                                {/* Content */}
                                <div className="flex flex-col items-center text-center mt-2">
                                    <div className="mb-8 px-6 w-full text-center">
                                        <p className="text-text-main opacity-70 text-[15px]">
                                            {isBlocked
                                                ? `Da li ste sigurni da želite da odblokirate korisnika `
                                                : `Da li ste sigurni da želite da blokirate korisnika `}
                                            <span className="font-semibold text-text-main">@{user?.username || user?.fullName}</span>
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="w-full px-6 pb-6 flex flex-col gap-3">
                                        <button
                                            onClick={async () => {
                                                await onBlockConfirm();
                                                onClose();
                                            }}
                                            disabled={blockLoading}
                                            className={`w-full py-3 rounded-full font-bold transition-all duration-200 cursor-pointer text-base flex items-center justify-center disabled:opacity-50 ${
                                                isBlocked
                                                    ? "bg-[#5b42f3] hover:bg-[#4b35d6] text-white"
                                                    : "bg-red-600 hover:bg-red-700 text-white"
                                            }`}
                                        >
                                            {blockLoading ? <Loader /> : isBlocked ? "Odblokiraj" : "Blokiraj"}
                                        </button>
                                        <button
                                            onClick={() => setView("menu")}
                                            className="w-full py-3 rounded-full bg-bg-4 dark:bg-bg-3 hover:bg-bg-4/80 dark:hover:bg-bg-3/80 text-text-main font-bold transition-all duration-200 cursor-pointer text-base"
                                        >
                                            Nazad
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
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
