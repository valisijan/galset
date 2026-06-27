import DesktopSidebar from "./Sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Podešavanja - Galset",
};

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="w-full bg-bg-1 min-h-[calc(100vh-50px)]">
            <div className="flex flex-col md:flex-row items-start max-w-5xl mx-auto w-full md:pt-10 md:pb-20 md:gap-8 px-4">
                <DesktopSidebar />
                <main className="flex-1 w-full min-w-0 md:mt-0 pt-4 md:pt-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
