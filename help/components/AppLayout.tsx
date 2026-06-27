"use client";

import { useEffect, useState } from "react";
import ChatSupport from "./ChatSupport";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";


export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isSidebarOpen]);

  const toggleSidebar = (open: boolean) => {
    if (open) {
      setIsSidebarOpen(true);
      window.history.pushState({ sidebarOpen: true }, "");
    } else {
      setIsSidebarOpen(false);
      if (window.history.state?.sidebarOpen) {
        window.history.back();
      }
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#1c1c1e] text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex flex-1 relative">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
          {children}
        </main>
      </div>

      <Footer />
      <ChatSupport />
    </div>
  );
}
