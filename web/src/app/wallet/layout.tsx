import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Novčanik - Galset",
};

export default function WalletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
