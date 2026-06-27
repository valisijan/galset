"use client";

import React, { useEffect, useRef } from "react";
import Loader from "./Loader";

interface InfiniteScrollProps {
    loadMore: () => void;
    hasMore: boolean;
    isLoading: boolean;
    className?: string;
    hideLoader?: boolean;
}

export default function InfiniteScroll({ loadMore, hasMore, isLoading, className = "", hideLoader = false }: InfiniteScrollProps) {
    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [loadMore, hasMore, isLoading]);

    if (!hasMore && !isLoading) return null;

    return (
        <div ref={observerTarget} className={`w-full py-10 flex justify-center items-center ${className}`}>
            {isLoading && !hideLoader && <Loader />}
        </div>
    );
}
