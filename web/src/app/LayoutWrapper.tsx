"use client";

import { usePathname, useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import DesktopMenu from "../components/DesktopMenu";
import BottomNav from "../components/BottomNav";
import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/hooks/useSocket";
import { usePushNotifications } from "@/hooks/usePushNotifications";

interface LayoutWrapperProps {
  children: ReactNode;
  initialSidebarOpen: boolean;
}

export default function LayoutWrapper({
  children,
  initialSidebarOpen,
}: LayoutWrapperProps) {
  const { user, sessionToken, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleOpen = () => {
      router.push("/auth");
    };

    window.addEventListener("open-auth-modal", handleOpen);

    return () => {
      window.removeEventListener("open-auth-modal", handleOpen);
    };
  }, [router]);

  useSocket(user?.id ? Number(user.id) : undefined, sessionToken || undefined);
  const { enableNotifications } = usePushNotifications(user?.id ? Number(user.id) : undefined);

  useEffect(() => {
    if (loading || typeof window === "undefined" || !user) return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

    const currentPermission = Notification.permission;
    if (currentPermission === "default") {
      const hasPrompted = sessionStorage.getItem("prompted_notifications");
      if (!hasPrompted) {
        sessionStorage.setItem("prompted_notifications", "true");
        enableNotifications();
      }
    }
  }, [user, loading, enableNotifications]);

  useEffect(() => {
    if (!user && typeof window !== "undefined") {
      sessionStorage.removeItem("prompted_notifications");
    }
  }, [user]);

  if (typeof window !== "undefined") {
    (window as any).__sessionToken = sessionToken;
    if (!(window as any).__fetchPatched) {
      (window as any).__fetchPatched = true;
      const originalFetch = window.fetch;
      window.fetch = async (input, init) => {
        let urlString = "";
        if (typeof input === "string") {
          urlString = input;
        } else if (input instanceof URL) {
          urlString = input.toString();
        } else if (input && typeof input === "object" && "url" in input) {
          urlString = (input as any).url;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (apiUrl && urlString.startsWith(apiUrl)) {
          const activeToken = (window as any).__sessionToken;
          if (activeToken) {
            const headers = new Headers();
            
            // 1. Copy headers from input (Request object) if it exists
            if (input instanceof Request) {
              input.headers.forEach((value, key) => {
                headers.set(key, value);
              });
            }
            
            // 2. Copy headers from init if it exists
            if (init?.headers) {
              const initHeaders = new Headers(init.headers);
              initHeaders.forEach((value, key) => {
                headers.set(key, value);
              });
            }
            
            // 3. Set Authorization header
            headers.set("Authorization", `Bearer ${activeToken}`);
            
            const newInit = { ...init, headers };
            return originalFetch(input, newInit);
          }
        }

        return originalFetch(input, init);
      };
    }
  }

  const pathname = usePathname() as string;
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(initialSidebarOpen);

  const isLoggedIn = !!user;

  useEffect(() => {
    if (!loading && !user) {
      const protectedRoutes = [
        "/inbox",
        "/ad",
        "/settings",
        "/my-ads",
        "/following",
        "/wishlist",
      ];

      const isProtected = protectedRoutes.some((route) =>
        pathname === route || pathname.startsWith(`${route}/`)
      );

      if (isProtected) {
        router.push("/");
      }
    }
  }, [user, loading, pathname, router]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Force scroll to top on route change (fixes Next.js scroll restoration quirks)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  useEffect(() => {
    const isInsideAddAd = pathname.startsWith("/ad/");
    const wasInsideAddAd = localStorage.getItem("wasInsideAddAd") === "true";
    if (wasInsideAddAd && !isInsideAddAd) {
      localStorage.removeItem("adFlow_expandedCat");
      localStorage.removeItem("adFlow_navigationStack");
      localStorage.removeItem("adFlow_selectedSubCat");
      localStorage.removeItem("adFlow_details");
      localStorage.removeItem("adFlow_contact");
      localStorage.removeItem("adFlow_selectedSlug");
      sessionStorage.removeItem("adFlow_restoreSlug");
      sessionStorage.removeItem("adFlow_toasted");
      sessionStorage.removeItem("adFlow_newSession");
    }

    if (isInsideAddAd) {
      localStorage.setItem("wasInsideAddAd", "true");
    } else {
      localStorage.removeItem("wasInsideAddAd");
    }
  }, [pathname]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebarOpen", String(newState));
      document.cookie = `sidebarOpen=${newState}; path=/; max-age=31536000`;
      return newState;
    });
  };

  const isInbox = pathname.startsWith("/inbox");
  const isChatOpen = isInbox && pathname.split("/").length === 3;

  const isAddAd = pathname.startsWith("/ad/");
  const isProfile = pathname.startsWith("/profile");
  const isSettings = pathname.startsWith("/settings");

  const isAuth =
    pathname.startsWith("/auth") ||
    pathname.startsWith("/reset-password");

  const showHeader = true;

  const hideFooter = isInbox || isAddAd || isProfile || isAuth || isSettings || pathname.startsWith("/account") || pathname.startsWith("/map") || pathname.startsWith("/ai");

  const disableGlobalScroll = isInbox || pathname.startsWith("/map") || pathname.startsWith("/ai");

  return (
    <div
      className={`flex flex-col min-h-[100dvh] bg-bg-1 ${disableGlobalScroll ? "lock-scroll" : ""
        }`}
    >
      {showHeader && (
        <div className={isChatOpen && isMobile ? "touch-none" : ""}>
          <Header
            sidebarOpen={sidebarOpen}
            toggleSidebar={toggleSidebar}
          />
        </div>
      )}

      <div className={`flex flex-1 min-h-0 pt-[50px] ${!isLoggedIn ? 'md:pt-[50px]' : 'md:pt-0'}`}>
        {/* DESKTOP SIDEBAR */}
        {!isAuth && isLoggedIn && (
          <DesktopMenu isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        )}

        {/* MOBILE BOTTOM NAV */}
        {!isAuth && (
          <BottomNav />
        )}

        {/* MAIN */}
        <main
          className={`flex-1 transition-[padding-left] duration-300 max-w-full ${(!isAuth && isLoggedIn) ? (sidebarOpen ? "md:pl-[260px]" : "md:pl-[73px]") : ""
            } ${(!isAuth && !isChatOpen && !pathname.startsWith("/ai")) ? "pb-[60px] md:pb-0" : ""} ${disableGlobalScroll ? `overflow-hidden ${showHeader ? (isMobile ? "h-[calc(100dvh-50px)]" : (isLoggedIn ? "h-[100dvh]" : "h-[calc(100dvh-50px)]")) : "h-[100dvh]"}` : ""}`}
        >
          {children}
          {!hideFooter && <Footer />}
        </main>
      </div>
    </div>
  );
}
