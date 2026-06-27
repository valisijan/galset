import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pretraga korisnika - Galset",
};

export default function SearchUsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
