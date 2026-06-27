"use client";

import { Toaster } from "sonner";

export function ToasterWrapper() {
  return (
    <Toaster
      position="bottom-right"
      richColors
      closeButton
      expand={false}
      toastOptions={{
        duration: 5000,
        style: {
          background: "var(--bg-2)",
          color: "var(--text-main)",
          borderRadius: "1rem",
          padding: "1rem 1.2rem",
          border: "1px solid var(--bg-3)",
          boxShadow: "0 0 20px rgba(0, 0, 0, 0.3)",
        },
        className: "group transition-transform duration-150",
        descriptionClassName: "text-gray-400 text-sm mt-1",
      }}
    />
  );
}
