import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galset AI - Pretraga",
};

export default function AILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
