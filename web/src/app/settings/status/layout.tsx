import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Status naloga - Galset",
};

export default function StatusLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
