import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mapa - Galset",
};

export default function MapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
