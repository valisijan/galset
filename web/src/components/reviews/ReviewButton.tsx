"use client";

import { useState, useEffect } from "react";
import ReviewModal from "./ReviewModal";

interface ReviewButtonProps {
    targetUserId: number;
    currentUserId: number | null;
}

export default function ReviewButton({ targetUserId, currentUserId }: ReviewButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("action") === "review") {
            setIsModalOpen(true);
        }
    }, []);

    const handleClick = () => {
        if (!currentUserId) {
            window.location.href = "/auth?mode=login";
            return;
        }
        setIsModalOpen(true);
    };

    if (targetUserId === currentUserId) return null;

    return (
        <>
            <button
                onClick={handleClick}
                className="bg-[#5b42f3] hover:bg-[#4b35d6] text-text-main font-medium px-6 py-2 rounded-xl transition-colors"
            >
                Oceni
            </button>

            <ReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                targetUserId={targetUserId}
            />
        </>
    );
}
