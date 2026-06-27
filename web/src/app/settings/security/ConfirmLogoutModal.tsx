"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Loader from "@/components/Loader"

interface ConfirmLogoutModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  loading: boolean
  mode: "single" | "all"
}

export default function ConfirmLogoutModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  mode,
}: ConfirmLogoutModalProps) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState({ modal: "confirmLogout" }, "");

    const handlePopState = () => {
      onCloseRef.current();
    };

    window.addEventListener("popstate", handlePopState);
    document.body.classList.add("lock-scroll");
    document.documentElement.classList.add("lock-scroll");

    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.body.classList.remove("lock-scroll");
      document.documentElement.classList.remove("lock-scroll");

      if (window.history.state?.modal === "confirmLogout") {
        window.history.back();
      }
    };
  }, [isOpen]);
  const title = mode === "all" ? "Odjavi sa svih uređaja?" : "Odjaviti uređaj?"
  const description =
    mode === "all"
      ? "Da li ste sigurni da želite da se odjavite sa svih uređaja?"
      : "Da li ste sigurni da želite da se odjavite sa ovog uređaja?"

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80"
            onClick={!loading ? onClose : undefined}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-bg-2 w-full max-w-[400px] rounded-4xl z-[10100] overflow-hidden"
          >
            {/* Centered Header */}
            <div className="pt-8 pb-1 text-center">
              <h3 className="text-text-main font-bold text-lg">
                {mode === "all" ? "Odjavi sa svih uređaja" : "Odjavi se sa uređaja"}
              </h3>
            </div>

            <div className="px-6 pb-6 mt-2 text-center">
              <p className="text-gray-400 text-sm leading-relaxed">
                {description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="w-full px-6 pb-6 flex flex-col gap-3">
              <button
                onClick={onConfirm}
                disabled={loading}
                className="w-full py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold transition-all duration-200 cursor-pointer text-base flex justify-center items-center disabled:opacity-50"
              >
                {loading ? <Loader /> : mode === "all" ? "Odjavi sve" : "Odjavi se"}
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-full bg-bg-4 dark:bg-bg-3 hover:bg-bg-4/80 dark:hover:bg-bg-3/80 text-text-main font-medium transition-all duration-200 cursor-pointer text-base"
              >
                Zatvori
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
