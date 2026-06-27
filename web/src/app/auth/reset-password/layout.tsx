import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Promena lozinke - Galset",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
