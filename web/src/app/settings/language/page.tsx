"use client";

import { useState } from "react";

export default function LanguageSettingsPage() {
    const [language, setLanguage] = useState("Srpski");

    return (
        <div className="w-full relative pb-20">
            <h1 className="text-2xl font-bold text-text-main mb-8">Jezik</h1>

            <section className="space-y-6">
                <div
                    className="flex items-center justify-between w-full px-6 py-4 rounded-full bg-bg-2 border border-bg-3 transition-all duration-200"
                >
                    <span className="text-text-main font-medium text-sm">Izabrani jezik</span>
                    <span className="text-gray-400 font-medium text-sm flex-shrink-0">{language}</span>
                </div>
            </section>
        </div>
    );
}
