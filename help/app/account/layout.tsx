import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Moj nalog",
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
