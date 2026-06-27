"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import ReportIssueModal from "@/components/modals/ReportIssueModal";
import { useAuth } from "@/context/AuthContext";

export default function HelpPage() {
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const { user } = useAuth();

    const links = [
        { name: "Centar za pomoć", href: "https://help.galset.com" },
        { name: "Status naloga", href: "/settings/status" },
        { name: "Uslovi korišćenja", href: "/policies/terms-of-use" },
        { name: "Politika privatnosti", href: "/policies/privacy-policy" },
        { name: "Politika kolačića", href: "/policies/cookie-policy" },
        { name: "Smernice zajednice", href: "/policies/community-guidelines" },
        { name: "Galset krediti", href: "/policies/credits" },
        { name: "Cenovnik", href: "/pricing" },
        { name: "Kontaktirajte nas", href: "https://help.galset.com/contact" },
        {
            name: "Prijavi problem", action: () => {
                if (!user) {
                    window.dispatchEvent(new Event("open-auth-modal"));
                } else {
                    setIsReportModalOpen(true);
                }
            }
        }
    ];

    return (
        <div className="w-full max-w-xl mx-auto bg-bg-1 min-h-[calc(100vh-50px)] pt-6 pb-10 px-4">
            <h1 className="text-2xl font-bold mb-6 text-text-main">Pomoć</h1>

            <div className="flex flex-col gap-3">
                {links.map((link) => {
                    if ("action" in link) {
                        return (
                            <button
                                key={link.name}
                                onClick={link.action}
                                className="flex items-center justify-between p-4 bg-bg-2 border border-bg-3 rounded-full hover:bg-bg-3 transition-all cursor-pointer w-full text-left"
                            >
                                <span className="font-semibold text-[15px]">{link.name}</span>
                                <ChevronRight size={18} className="text-gray-400" />
                            </button>
                        );
                    }

                    const isExternal = link.href.startsWith("http");

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            target={isExternal ? "_blank" : undefined}
                            rel={isExternal ? "noopener noreferrer" : undefined}
                            className="flex items-center justify-between p-4 bg-bg-2 border border-bg-3 rounded-full hover:bg-bg-3 transition-all"
                        >
                            <span className="font-semibold text-[15px]">{link.name}</span>
                            <ChevronRight size={18} className="text-gray-400" />
                        </Link>
                    );
                })}
            </div>

            <ReportIssueModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
            />
        </div>
    );
}