import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Podešavanje jezika - Galset",
};

export default function LanguageLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
