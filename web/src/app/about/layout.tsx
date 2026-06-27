import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "O nama - Galset",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
