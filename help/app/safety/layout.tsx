import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bezbednost",
};

export default function SafetyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
