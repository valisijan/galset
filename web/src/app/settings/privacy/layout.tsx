import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Podešavanje privatnosti - Galset",
};

export default function PrivacyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
