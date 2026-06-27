"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Smartphone, TvMinimal, MapPin, Clock, Shield, Wifi } from "lucide-react"
import Loader from "@/components/Loader"

export interface SessionData {
  id: string
  userAgent: string | null
  ipAddress: string | null
  deviceType: string | null
  location: string | null
  createdAt: string | null
  expires: string | null
  isCurrent: boolean
}

interface SessionDetailModalProps {
  session: SessionData | null
  isOpen: boolean
  onClose: () => void
  onLogout: (sessionId: string) => Promise<void>
  loading: boolean
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Nepoznato"
  const date = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sessionDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  const timeStr = `${hours}:${minutes}`

  const diffDays = Math.round((today.getTime() - sessionDay.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return `Danas ${timeStr}`
  if (diffDays === 1) return `Juče ${timeStr}`

  const months = [
    "Januar", "Februar", "Mart", "April", "Maj", "Jun",
    "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar",
  ]
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  const currentYear = now.getFullYear()

  if (year === currentYear) return `${day} ${month} ${timeStr}`
  return `${day} ${month} ${year} ${timeStr}`
}

export default function SessionDetailModal({
  session,
  isOpen,
  onClose,
  onLogout,
  loading,
}: SessionDetailModalProps) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState({ modal: "sessionDetail" }, "");

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

      if (window.history.state?.modal === "sessionDetail") {
        window.history.back();
      }
    };
  }, [isOpen]);

  if (!session) return null

  const isMobile = session.deviceType === "mobile"

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-bg-2 w-full max-w-[400px] rounded-4xl z-[10100] overflow-hidden"
          >
            {/* Centered Header */}
            <div className="pt-8 pb-1 text-center">
              <h3 className="text-text-main font-bold text-lg">Detalji uređaja</h3>
            </div>

            {/* Device icon + name */}
            <div className="px-6 pb-6 mt-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-bg-3 flex items-center justify-center flex-shrink-0">
                  {isMobile ? (
                    <Smartphone size={26} className="text-gray-300" />
                  ) : (
                    <TvMinimal size={26} className="text-gray-300" />
                  )}
                </div>
                <div>
                  <p className="text-text-main font-semibold text-base leading-tight">
                    {session.userAgent || "Nepoznat uređaj"}
                  </p>
                  {session.isCurrent && (
                    <span className="inline-flex items-center gap-1 mt-1 text-[11px] text-[#6366f1] font-medium">
                      <Shield size={10} />
                      Trenutni uređaj
                    </span>
                  )}
                </div>
              </div>

              {/* Info rows */}
              <div className="space-y-3">
                <InfoRow
                  icon={<MapPin size={18} className="text-gray-400" />}
                  label="Lokacija"
                  value={session.location || "Nepoznato"}
                />
                <InfoRow
                  icon={<Clock size={18} className="text-gray-400" />}
                  label="Prijava"
                  value={formatDate(session.createdAt)}
                />
                <InfoRow
                  icon={<Wifi size={18} className="text-gray-400" />}
                  label="IP adresa"
                  value={session.ipAddress || "Nepoznato"}
                />
              </div>

            </div>

            {/* Action Buttons */}
            <div className="w-full px-6 pb-6 flex flex-col gap-3">
              <button
                onClick={() => onLogout(session.id)}
                disabled={loading}
                className="w-full py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold transition-all duration-200 cursor-pointer text-base flex justify-center items-center disabled:opacity-50"
              >
                {loading ? <Loader /> : "Odjavi se"}
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

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-3.5 rounded-xl bg-bg-3/50">
      <div className="flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-gray-400 text-[11px] leading-none mb-0.5">{label}</p>
        <p className="text-text-main text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  )
}
