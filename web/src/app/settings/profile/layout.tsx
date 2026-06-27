import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Uređivanje profila - Galset",
};

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
