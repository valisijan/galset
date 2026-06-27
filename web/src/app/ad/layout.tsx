import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Novi oglas - Galset",
};

export default function AdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
