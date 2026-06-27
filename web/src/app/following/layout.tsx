import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Moja praćenja - Galset",
};

export default function FollowingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
