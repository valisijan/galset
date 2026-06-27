"use client";

import { usePathname } from "next/navigation";
import ChatList from "./components/ChatList";
import { AnimatePresence, motion } from "framer-motion";

export default function InboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isChatOpen = (pathname || "").split("/").length > 2;

  return (
    <div className="h-full bg-bg-1 overflow-hidden flex flex-col">

      {/* DESKTOP */}
      <div className="hidden md:flex h-full max-w-[1400px] mx-auto w-full px-4 py-10 gap-6 justify-center">
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="rounded-3xl flex flex-col overflow-hidden shrink-0"
          style={{ width: isChatOpen ? "350px" : "450px" }}
        >
          <ChatList />
        </motion.div>

        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              key="chat-window"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex-1 flex flex-col min-h-0 overflow-hidden"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MOBILE */}
      <div className="md:hidden h-full w-full overflow-hidden">
        {!isChatOpen ? <ChatList /> : children}
      </div>

    </div>
  );
}
