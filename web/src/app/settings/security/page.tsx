"use client";

import { useState, useEffect, useCallback } from "react";
import { Pen, Smartphone, TvMinimal, ChevronRight, LogOut, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import PasswordModal from "./PasswordModal";
import SessionDetailModal, { SessionData } from "./SessionDetailModal";
import ConfirmLogoutModal from "./ConfirmLogoutModal";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

function formatDate(dateStr: string | null): string {
    if (!dateStr) return "Nepoznato";
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sessionDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const hh = date.getHours().toString().padStart(2, "0");
    const mm = date.getMinutes().toString().padStart(2, "0");
    const timeStr = `${hh}:${mm}`;
    const diffDays = Math.round((today.getTime() - sessionDay.getTime()) / 86_400_000);
    if (diffDays === 0) return `Danas ${timeStr}`;
    if (diffDays === 1) return `Juče ${timeStr}`;
    const months = ["Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    if (year === now.getFullYear()) return `${day} ${month} ${timeStr}`;
    return `${day} ${month} ${year} ${timeStr}`;
}

function SessionCard({ session, onClick }: { session: SessionData; onClick: () => void }) {
    const isMobile = session.deviceType === "mobile";

    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-3xl bg-bg-2 border border-bg-3 hover:bg-bg-3 hover:cursor-pointer text-left group transition-all duration-300"
        >
            {/* Icon */}
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-bg-3 flex items-center justify-center">
                {isMobile ? (
                    <Smartphone size={20} className="text-gray-500" />
                ) : (
                    <TvMinimal size={20} className="text-gray-500" />
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-text-main text-sm font-semibold truncate">
                        {session.userAgent || "Nepoznat uređaj"}
                    </span>
                    {session.isCurrent && (
                        <span className="inline-flex items-center text-[10px] text-[#6366f1]/80 font-medium bg-[#6366f1]/10 px-2 py-0.5 rounded-full flex-shrink-0">
                            Ovaj uređaj
                        </span>
                    )}
                </div>
                <p className="text-gray-400 text-xs truncate">
                    {session.location || "Nepoznata lokacija"}
                </p>
                <p className="text-gray-400 text-[11px] mt-0.5">
                    {formatDate(session.createdAt)}
                </p>
            </div>

            {/* Arrow */}
            <ChevronRight
                size={18}
                className="text-gray-500 group-hover:text-gray-300 transition-colors flex-shrink-0"
            />
        </button>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SecuritySettingsPage() {
    const { sessionToken, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // Sessions state
    const [activeSessions, setActiveSessions] = useState<SessionData[]>([]);
    const [sessionsLoading, setSessionsLoading] = useState(true);

    // Detail modal
    const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
    const [showDetail, setShowDetail] = useState(false);
    const [logoutOneLoading, setLogoutOneLoading] = useState(false);

    // Confirm modal
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmMode, setConfirmMode] = useState<"single" | "all">("single");
    const [confirmLoading, setConfirmLoading] = useState(false);
    // ID used when confirming logout of a single session from confirm modal
    const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);

    const gradientBtn = "transition-all duration-[350ms] linear bg-[#5b42f3] hover:bg-[#4b35d6]";

    // ── Fetch sessions ──
    const fetchSessions = useCallback(async () => {
        if (!sessionToken) return;
        if (activeSessions.length === 0) setSessionsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions`);
            if (!res.ok) return;
            const data = await res.json();
            setActiveSessions(data.sessions ?? []);
        } catch { /* silent */ }
        finally { setSessionsLoading(false); }
    }, [sessionToken, activeSessions.length]);

    useEffect(() => {
        if (sessionToken) {
            fetchSessions();
        }
    }, [sessionToken, fetchSessions]);

    // ── Open detail modal ──
    const openDetail = (session: SessionData) => {
        setSelectedSession(session);
        setShowDetail(true);
    };

    // ── Logout single session (from detail modal — triggers confirm) ──
    const handleLogoutOne = async (sessionId: string) => {
        setPendingSessionId(sessionId);
        setShowDetail(false);
        setConfirmMode("single");
        setTimeout(() => setShowConfirm(true), 150);
    };

    // ── Logout all (button) ──
    const handleLogoutAllClick = () => {
        setConfirmMode("all");
        setShowConfirm(true);
    };

    // ── Confirm action ──
    const handleConfirm = async () => {
        setConfirmLoading(true);
        const shouldRedirect = confirmMode === "all" || (pendingSessionId ? activeSessions.find(s => s.id === pendingSessionId)?.isCurrent : false);

        try {
            if (confirmMode === "all") {
                try {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/all`, { method: "DELETE" });
                } catch (e) {
                    console.error("Failed to delete all sessions on server", e);
                }
                toast.success("Uspešno ste odjavljeni sa svih uređaja.");
                await logout();
            } else if (pendingSessionId) {
                try {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${pendingSessionId}`, { method: "DELETE" });
                } catch (e) {
                    console.error("Failed to delete session on server", e);
                }

                const sessionToDel = activeSessions.find(s => s.id === pendingSessionId);
                toast.success("Uspešno ste odjavljeni sa uređaja.");

                if (sessionToDel?.isCurrent) {
                    await logout();
                } else {
                    setPendingSessionId(null);
                    setShowConfirm(false);
                    setShowDetail(false);
                    await fetchSessions();
                }
            }
        } catch (err) {
            console.error("Error during session logout", err);
            toast.error("Greška pri odjavljivanju.");
        } finally {
            setConfirmLoading(false);
            if (shouldRedirect) {
                window.location.href = '/';
            }
        }
    };

    const ActionButton = ({ label = "Promeni" }: { label?: string }) => (
        <button
            onClick={() => setShowPasswordModal(true)}
            className={`flex items-center justify-center gap-2 p-3 md:px-6 md:py-4 rounded-full text-white text-sm font-medium cursor-pointer ${gradientBtn}`}
            title={label}
        >
            <Pen size={16} className="text-white" />
            <span className="hidden md:inline">{label}</span>
        </button>
    );

    return (
        <div className="w-full relative pb-20">
            <h1 className="text-text-main text-xl sm:text-2xl font-bold mt-4 mb-8 text-center">Bezbednost</h1>

            {/* ── Password ── */}
            <section className="space-y-6 mb-10">
                <button
                    onClick={() => setShowPasswordModal(true)}
                    className="flex items-center justify-between w-full px-6 py-4 rounded-full bg-bg-2 border border-bg-3 cursor-pointer transition-all duration-200 hover:bg-bg-3"
                >
                    <span className="text-text-main font-medium text-sm">Promeni lozinku</span>
                    <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
                </button>
            </section>

            {/* ── Active Devices ── */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-text-main text-base font-semibold">Aktivni uređaji</h2>
                    {activeSessions.length > 1 && (
                        <span className="text-gray-500 text-xs">
                            {activeSessions.length} uređaja
                        </span>
                    )}
                </div>

                {sessionsLoading ? (
                    <div className="space-y-3">
                        {[1, 2].map((i) => (
                            <div
                                key={i}
                                className="h-[76px] rounded-3xl bg-bg-2/40 animate-pulse"
                            />
                        ))}
                    </div>
                ) : activeSessions.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nema aktivnih sesija.</p>
                ) : (
                    <div className="space-y-3">
                        {activeSessions.map((s) => (
                            <SessionCard
                                key={s.id}
                                session={s}
                                onClick={() => openDetail(s)}
                            />
                        ))}
                    </div>
                )}

                {/* Logout all button */}
                {!sessionsLoading && activeSessions.length > 0 && (
                    <div className="flex justify-center w-full">
                        <button
                            onClick={handleLogoutAllClick}
                            className="mt-6 flex items-center gap-2 px-6 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-all duration-200 cursor-pointer border-none"
                        >
                            <LogOut size={15} />
                            Odjavi se sa svih uređaja
                        </button>
                    </div>
                )}
            </section>

            {/* ── Modals ── */}
            <PasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
            />

            <SessionDetailModal
                session={selectedSession}
                isOpen={showDetail}
                onClose={() => setShowDetail(false)}
                onLogout={handleLogoutOne}
                loading={logoutOneLoading}
            />

            <ConfirmLogoutModal
                isOpen={showConfirm}
                onClose={() => !confirmLoading && setShowConfirm(false)}
                onConfirm={handleConfirm}
                loading={confirmLoading}
                mode={confirmMode}
            />
        </div>
    );
}

// ─── FloatingInput ─────────────────────────────────────────────────────────────
function FloatingInput({
    label,
    name,
    value,
    type = "text",
    onChange,
    rightElement,
    readOnly,
}: {
    label: string;
    name: string;
    value: string;
    type?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    rightElement?: React.ReactNode;
    readOnly?: boolean;
}) {
    const [isFocused, setIsFocused] = useState(false);
    const active = isFocused || (value && value.length > 0) || type === "date";

    return (
        <div className="flex flex-col gap-2">
            <div className="relative flex items-center">
                <div className={`relative flex-1 ${readOnly ? "cursor-not-allowed opacity-70 pointer-events-none" : ""}`}>
                    <input
                        type={type}
                        name={name}
                        value={value}
                        readOnly={readOnly}
                        onChange={onChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className={`w-full bg-transparent border px-4 py-4 text-text-main focus:outline-none transition-all rounded-full border-bg-4 ${rightElement ? "pr-16 md:pr-6" : ""}`}
                    />

                    <label
                        className={`absolute left-4 transition-all pointer-events-none bg-bg-1 px-1
                            ${active
                                ? `-top-2 text-sm text-gray-300`
                                : `top-1/2 -translate-y-1/2 text-gray-400`
                            }`}
                    >
                        {label}
                    </label>

                    {rightElement && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10 md:hidden">
                            {rightElement}
                        </div>
                    )}
                </div>

                {rightElement && (
                    <div className="hidden md:block ml-4">
                        {rightElement}
                    </div>
                )}
            </div>
        </div>
    );
}
