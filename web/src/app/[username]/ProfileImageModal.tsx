import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import Image from "next/image";

interface ProfileImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    altText: string;
}

export default function ProfileImageModal({ isOpen, onClose, imageUrl, altText }: ProfileImageModalProps) {
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;

        window.history.pushState({ modalOpen: "profile-image" }, "", window.location.href);

        const handlePopState = () => {
            onCloseRef.current();
        };

        window.addEventListener("popstate", handlePopState);

        document.body.classList.add("lock-scroll");
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

        return () => {
            window.removeEventListener("popstate", handlePopState);
            if (window.history.state?.modalOpen === "profile-image") {
                window.history.back();
            }
            document.body.classList.remove("lock-scroll");
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="profile-image-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[999999999] flex items-center justify-center p-4 bg-black/80 cursor-pointer"
                    onClick={onClose}
                >
                    {/* Image Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-[80vw] h-[80vw] max-w-[450px] max-h-[450px] sm:w-[60vw] sm:h-[60vw] md:w-[450px] md:h-[450px] rounded-full overflow-hidden shadow-2xl shrink-0 cursor-default"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src={imageUrl}
                            alt={altText}
                            fill
                            className="object-cover"
                            priority
                            unoptimized
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
