import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pretraga",
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
