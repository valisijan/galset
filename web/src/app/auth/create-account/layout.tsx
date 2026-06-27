import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kreirajte nalog - Galset",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
