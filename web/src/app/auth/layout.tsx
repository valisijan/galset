import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prijavljivanje - Galset",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
