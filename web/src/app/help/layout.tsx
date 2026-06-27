import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pomoć - Galset",
};

export default function HelpLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
