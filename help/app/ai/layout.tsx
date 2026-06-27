import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galset AI",
};

export default function AILayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
