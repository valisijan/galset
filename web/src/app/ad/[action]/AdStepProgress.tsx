"use client"

import React from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

interface AdStepProgressProps {
    currentStep: 1 | 2 | 3
}

export default function AdStepProgress({ currentStep }: AdStepProgressProps) {
    const params = useParams();
    const searchParams = useSearchParams();
    const action = params?.action as string || "add";
    const adId = searchParams?.get('adId');
    const draftId = searchParams?.get('draftId');
    const query = action === 'edit' && adId 
        ? `?adId=${adId}` 
        : (action === 'add' && draftId ? `?draftId=${draftId}` : '');
    const { user } = useAuth();

    const [isStep2Valid, setIsStep2Valid] = React.useState(false);
    const [isCategorySelected, setIsCategorySelected] = React.useState(false);
    const [hasVisitedPromotion, setHasVisitedPromotion] = React.useState(false);

    const checkStatus = () => {
        const selectedSlug = localStorage.getItem("adFlow_selectedSlug");
        setIsCategorySelected(!!selectedSlug);

        const visited = typeof window !== "undefined" && sessionStorage.getItem("adFlow_visitedPromotion") === "true";
        setHasVisitedPromotion(visited);

        const detailsStr = localStorage.getItem("adFlow_details");
        if (detailsStr) {
            try {
                const details = JSON.parse(detailsStr);
                const isValid = !!(
                    details.title?.trim() &&
                    (details.toggle || (details.price && details.price.trim())) &&
                    details.state &&
                    details.description?.trim() &&
                    details.description !== "<br>" &&
                    details.city
                );
                setIsStep2Valid(isValid);
            } catch (e) {
                setIsStep2Valid(false);
            }
        }
    };

    React.useEffect(() => {
        checkStatus();

        const handleUpdate = () => checkStatus();
        window.addEventListener("adFlowUpdate", handleUpdate);
        window.addEventListener("storage", handleUpdate);

        return () => {
            window.removeEventListener("adFlowUpdate", handleUpdate);
            window.removeEventListener("storage", handleUpdate);
        };
    }, [currentStep]);

    const steps = [
        { id: 1, label: "Kategorija", href: `/ad/${action}${query}`, isUnlocked: true },
        { id: 2, label: "Detalji", href: `/ad/${action}/form${query}`, isUnlocked: isCategorySelected },
        { id: 3, label: "Vidljivost", href: `/ad/${action}/promotion${query}`, isUnlocked: hasVisitedPromotion || (isStep2Valid && isCategorySelected) },
    ]

    const isLoggedIn = !!user;

    return (
        <div className={`sticky ${isLoggedIn ? "top-[50px] md:top-0" : "top-[50px]"} z-40 w-full bg-gradient-to-b from-bg-1 via-bg-1/90 to-transparent pt-4 pb-8 transition-all duration-300 pointer-events-none`}>
            <div className="w-full max-w-[800px] mx-auto pointer-events-auto">
                <div className="relative flex justify-between items-center w-full px-0">
                    {/* Progress Lines Container */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-[50px] right-[50px] md:left-[56px] md:right-[56px] h-[5px] z-0">
                        {/* Background Line */}
                        <div className="absolute inset-0 bg-bg-3" />

                        {/* Active Line (Line 1-2) */}
                        <div
                            className="absolute top-0 left-0 h-full bg-[#5b42f3] hover:bg-[#4b35d6] transition-all duration-300"
                            style={{
                                width: "50%",
                                opacity: (currentStep >= 2 || hasVisitedPromotion || isCategorySelected) ? 1 : 0
                            }}
                        />
                        {/* Active Line (Line 2-3) */}
                        <div
                            className="absolute top-0 left-[50%] h-full bg-[#5b42f3] hover:bg-[#4b35d6] transition-all duration-300"
                            style={{
                                width: "50%",
                                opacity: (currentStep >= 3 || hasVisitedPromotion) ? 1 : 0
                            }}
                        />
                    </div>

                    {steps.map((step) => {
                        const isPast = step.id < currentStep;
                        const isCurrent = step.id === currentStep;
                        const isFuture = step.id > currentStep;
                        const canNavigate = step.isUnlocked;
                        const isClickable = canNavigate && !isCurrent;

                        const content = (
                            <div className="relative z-10 flex flex-col items-center group">
                                <div
                                    className={`px-5 py-2 rounded-full text-xs md:text-sm font-bold border-2 transition-all duration-300 flex items-center justify-center ${isCurrent
                                        ? "bg-[#5b42f3] border-[#6366f1] text-white"
                                        : canNavigate
                                            ? "bg-bg-2 hover:bg-bg-3 border-[#6366f1] text-text-main"
                                            : "bg-bg-2 border-bg-3 text-gray-500"
                                        } ${isClickable ? "cursor-pointer group-hover:scale-105" : "cursor-default"}`}
                                >
                                    {step.label}
                                </div>
                            </div>
                        );

                        if (canNavigate && !isCurrent) {
                            return (
                                <Link
                                    key={step.id}
                                    href={step.href}
                                    onClick={() => {
                                        sessionStorage.setItem("adFlow_navigatingInternal", "true");
                                        if (step.id === 1) {
                                            const slug = localStorage.getItem("adFlow_selectedSlug");
                                            if (slug) {
                                                sessionStorage.setItem("adFlow_restoreSlug", slug);
                                            }
                                        }
                                    }}
                                    className="cursor-pointer no-underline"
                                >
                                    {content}
                                </Link>
                            );
                        }

                        return (
                            <div key={step.id} className="cursor-default">
                                {content}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}
