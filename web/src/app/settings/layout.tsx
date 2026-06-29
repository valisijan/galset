"use client";

import { useEffect } from "react";
import DesktopSidebar from "./Sidebar";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isSettingOpen = pathname !== "/settings";

    useEffect(() => {
        document.title = "Podešavanja - Galset";
    }, [pathname]);

    return (
        <div className="w-full bg-bg-1 min-h-[calc(100vh-50px)]">
            {/* DESKTOP */}
            <div className="hidden md:flex max-w-5xl mx-auto w-full pt-2 pb-20 gap-8 justify-center items-start px-4">
                <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="flex flex-col overflow-hidden shrink-0"
                    style={{ width: isSettingOpen ? "300px" : "380px" }}
                >
                    <DesktopSidebar />
                </motion.div>

                <AnimatePresence>
                    {isSettingOpen && (
                        <motion.div
                            key="settings-content"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="flex-1 flex flex-col min-h-0"
                        >
                            {children}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* MOBILE */}
            <div className="md:hidden w-full px-4 pt-2 pb-10">
                {children}
            </div>
        </div>
    );
}
