import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Podešavanje bezbednosti - Galset",
};

export default function SecurityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
