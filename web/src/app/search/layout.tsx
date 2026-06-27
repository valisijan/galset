import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galset pretraga",
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
