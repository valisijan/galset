import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Oglasi",
};

export default function AdsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
