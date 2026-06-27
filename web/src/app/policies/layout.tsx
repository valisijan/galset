import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Uslovi i politike - Galset",
};

export default function PoliciesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
