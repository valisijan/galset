import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Moj nalog - Galset",
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
