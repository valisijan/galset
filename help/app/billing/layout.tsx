import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plaćanje",
};

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
