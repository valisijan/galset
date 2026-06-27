import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prijavite se - Galset",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
