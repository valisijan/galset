import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lični podaci - Galset",
};

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
