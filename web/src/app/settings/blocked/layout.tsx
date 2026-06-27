import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blokirani korisnici - Galset",
};

export default function BlockedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
