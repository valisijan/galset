import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kategorije - Galset",
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
