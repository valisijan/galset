"use client"

import React from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'

interface AdStepProgressProps {
    currentStep: 1 | 2 | 3
}

export default function AdStepProgress({ currentStep }: AdStepProgressProps) {
    const params = useParams();
    const searchParams = useSearchParams();
    const action = params?.action as string || "add";
    const adId = searchParams?.get('adId');
    const query = action === 'edit' && adId ? `?adId=${adId}` : '';

    const [isStep2Valid, setIsStep2Valid] = React.useState(false);
    const [isCategorySelected, setIsCategorySelected] = React.useState(false);

    const checkStatus = () => {
        const selectedSlug = localStorage.getItem("adFlow_selectedSlug");
        setIsCategorySelected(!!selectedSlug);

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
        { id: 3, label: "Vidljivost", href: `/ad/${action}/promotion${query}`, isUnlocked: isStep2Valid && isCategorySelected },
    ]

    return (
        <div className="w-full max-w-[800px] mx-auto mb-12">
            <div className="relative flex justify-between">
                {/* Progress Lines Container */}
                <div className="absolute top-[11.5px] left-[20px] right-[20px] h-[5px]">
                    {/* Background Line */}
                    <div className="absolute inset-0 bg-bg-3" />

                    {/* Active Line (Line 1-2) */}
                    <div
                        className="absolute top-0 left-0 h-full bg-[#5b42f3] hover:bg-[#4b35d6] transition-all duration-300"
                        style={{
                            width: "50%",
                            opacity: currentStep >= 2 ? 1 : 0
                        }}
                    />
                    {/* Active Line (Line 2-3) */}
                    <div
                        className="absolute top-0 left-[50%] h-full bg-[#5b42f3] hover:bg-[#4b35d6] transition-all duration-300"
                        style={{
                            width: "50%",
                            opacity: currentStep >= 3 ? 1 : 0
                        }}
                    />
                </div>

                {steps.map((step) => {
                    const isPast = step.id < currentStep;
                    const isCurrent = step.id === currentStep;
                    const isFuture = step.id > currentStep;
                    const canNavigate = step.isUnlocked;

                    const content = (
                        <div className="relative z-10 flex flex-col items-center group">
                            <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 border-[5px] ${isCurrent
                                    ? "bg-[#5b42f3] hover:bg-[#4b35d6] border-[#6366f1]"
                                    : isPast
                                        ? "bg-bg-1 border-[#6366f1]"
                                        : "bg-bg-1 border-bg-3"
                                    } ${canNavigate ? "cursor-pointer group-hover:scale-110" : "cursor-default"}`}
                            >
                            </div>
                            <span className={`mt-2 text-xs md:text-sm font-bold transition-colors duration-300 ${isCurrent || isPast ? "text-text-main" : "text-gray-500"
                                } ${canNavigate ? "group-hover:text-text-main" : ""}`}>
                                {step.label}
                            </span>
                        </div>
                    );

                    if (canNavigate && !isCurrent) {
                        return (
                            <Link
                                key={step.id}
                                href={step.href}
                                onClick={() => {
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
    )
}
