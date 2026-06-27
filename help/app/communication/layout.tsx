import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Komunikacija",
};

export default function CommunicationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
