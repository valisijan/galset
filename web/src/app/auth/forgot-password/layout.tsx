import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zaboravljena lozinka - Galset",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
