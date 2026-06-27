import "../app/globals.css";
import "leaflet/dist/leaflet.css";
import type { ReactNode } from "react";
import { AuthProvider } from "../context/AuthContext";
import { CountsProvider } from "../context/CountsContext";
import { ThemeProvider } from "../context/ThemeContext";
import { ToasterWrapper } from "@/components/ToasterWrapper";
import LayoutWrapper from "./LayoutWrapper";
import Cookies from "@/components/Cookies";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import ThemeScript from "@/components/ThemeScript";

export const metadata = {
  title: "Galset - Oglasnik nove generacije",
  description: "Galset je oglasnik nove generacije, prodajte ili pronadjite sve sto vam treba uz Galset AI",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Galset - Oglasnik nove generacije",
    description: "Galset je oglasnik nove generacije, prodajte ili pronadjite sve sto vam treba uz Galset AI",
    images: [
      {
        url: "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/assets/og-image.png",
        width: 1200,
        height: 630,
        alt: "Galset Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Galset - Oglasnik nove generacije",
    description: "Galset je oglasnik nove generacije, prodajte ili pronadjite sve sto vam treba uz Galset AI",
    images: ["https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/assets/og-image.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const sidebarOpen = cookieStore.get("sidebarOpen")?.value !== "false";

  let initialUser = null;
  let initialSessionToken = null;
  try {
    const session = await auth();
    if (session?.user?.id) {
      initialSessionToken = (session as any).sessionToken ?? null;
      const userId = parseInt(session.user.id);
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
          id: true,
          fullName: true,
          username: true,
          email: true,
          country: true,
          city: true,
          address: true,
          phone: true,
          birthDate: true,
          profileImg: true,
        },
      });
      if (user) initialUser = {
        id: String(user.id),
        email: user.email,
        fullName: user.fullName ?? "",
        username: user.username ?? "",
        country: user.country ?? undefined,
        city: user.city ?? undefined,
        address: user.address ?? undefined,
        phone: user.phone ?? undefined,
        birthDate: user.birthDate instanceof Date ? user.birthDate.toISOString() : (user.birthDate ? String(user.birthDate) : undefined),
        profileImg: user.profileImg ?? undefined,
      };
    }
  } catch (e) {
  }

  return (
    <html lang="sr" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="bg-bg-1 text-text-main transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider initialUser={initialUser} initialSessionToken={initialSessionToken}>
            <CountsProvider>
              <LayoutWrapper initialSidebarOpen={sidebarOpen}>
                {children}
                <Cookies />
              </LayoutWrapper>

              <ToasterWrapper />
            </CountsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
