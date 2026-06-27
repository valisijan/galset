"use client";

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import DeleteAccountModal from "./DeleteAccountModal";
import DeactivateAccountModal from "./DeactivateAccountModal";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PrivacySettingsPage() {
    const { user, logout, sessionToken } = useAuth();
    const router = useRouter();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const [preferences, setPreferences] = useState({
        users: true,
        ads: true,
        recommended: true,
    });

    useEffect(() => {
        const saved = localStorage.getItem("galset_consent");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setPreferences({
                    users: parsed.users ?? true,
                    ads: parsed.ads ?? true,
                    recommended: parsed.recommended ?? true,
                });
            } catch (e) {
                if (user) {
                    setPreferences({ users: true, ads: true, recommended: true });
                }
            }
        } else {
            if (user) {
                setPreferences({ users: true, ads: true, recommended: true });
                localStorage.setItem("galset_consent", JSON.stringify({ users: true, ads: true, recommended: true, accepted: true }));
            } else {
                setPreferences({ users: false, ads: false, recommended: false });
            }
        }
    }, [user]);

    const togglePreference = (key: keyof typeof preferences) => {
        const newValue = !preferences[key];
        const newPrefs = {
            ...preferences,
            [key]: newValue,
        };
        setPreferences(newPrefs);
        localStorage.setItem("galset_consent", JSON.stringify({ ...newPrefs, accepted: true }));
    };

    const handleConfirmDeactivate = async () => {
        setLoading(true);
        try {
            const headers: Record<string, string> = {};
            if (sessionToken) {
                headers["Authorization"] = `Bearer ${sessionToken}`;
            }
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account/deactivate`, { 
                method: "POST", 
                headers 
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Vaš nalog je uspešno deaktiviran.");
                window.location.href = "/";
                logout();
            } else {
                toast.error("Greška pri deaktivaciji. Pokušajte ponovo.");
            }
        } catch {
            toast.error("Greška pri deaktivaciji. Pokušajte ponovo.");
        } finally {
            setLoading(false);
            setShowDeactivateModal(false);
        }
    };

    const handleConfirmDelete = async () => {
        setLoading(true);
        try {
            const headers: Record<string, string> = {};
            if (sessionToken) {
                headers["Authorization"] = `Bearer ${sessionToken}`;
            }
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account`, { 
                method: "DELETE",
                headers 
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Vaš nalog je uspešno obrisan.");
                window.location.href = "/";
                logout();
            } else {
                toast.error("Greška pri brisanju. Pokušajte ponovo.");
            }
        } catch {
            toast.error("Greška pri brisanju. Pokušajte ponovo.");
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 pb-20">
            <h1 className="text-2xl font-bold text-text-main">Privatnost</h1>

            <div className="flex flex-col gap-3">
                <h2 className="text-text-main font-bold text-base mb-1 mt-2">Podešavanja kolačića</h2>
                
                {/* Istorija pretrage korisnika */}
                <div className="flex items-center justify-between w-full px-5 py-4 rounded-full bg-bg-2 border border-bg-3">
                    <span className="text-text-main font-medium text-sm">Istorija pretrage korisnika</span>
                    <button
                        type="button"
                        onClick={() => togglePreference("users")}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${preferences.users ? "bg-[#5b42f3]" : "bg-bg-3"}`}
                    >
                        <span
                            className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${preferences.users ? "left-6" : "left-1"}`}
                        />
                    </button>
                </div>

                {/* Istorija pretrage oglasa */}
                <div className="flex items-center justify-between w-full px-5 py-4 rounded-full bg-bg-2 border border-bg-3">
                    <span className="text-text-main font-medium text-sm">Istorija pretrage oglasa</span>
                    <button
                        type="button"
                        onClick={() => togglePreference("ads")}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${preferences.ads ? "bg-[#5b42f3]" : "bg-bg-3"}`}
                    >
                        <span
                            className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${preferences.ads ? "left-6" : "left-1"}`}
                        />
                    </button>
                </div>

                {/* Preporuceni oglasi */}
                <div className="flex items-center justify-between w-full px-5 py-4 rounded-full bg-bg-2 border border-bg-3">
                    <span className="text-text-main font-medium text-sm">Preporučeni oglasi</span>
                    <button
                        type="button"
                        onClick={() => togglePreference("recommended")}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${preferences.recommended ? "bg-[#5b42f3]" : "bg-bg-3"}`}
                    >
                        <span
                            className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${preferences.recommended ? "left-6" : "left-1"}`}
                        />
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <h2 className="text-text-main font-bold text-base mb-1 mt-2">Deaktivacija i brisanje naloga</h2>
                {/* Deactivate Account Card */}
                <button
                    onClick={() => setShowDeactivateModal(true)}
                    className="flex items-center justify-between w-full px-6 py-4 rounded-full bg-bg-2 border border-bg-3 cursor-pointer transition-all duration-200 hover:bg-bg-3"
                >
                    <span className="text-text-main font-medium text-sm">Deaktiviraj nalog</span>
                    <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
                </button>

                {/* Delete Account Card */}
                <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center justify-between w-full px-6 py-4 rounded-full bg-bg-2 border border-bg-3 cursor-pointer transition-all duration-200 hover:bg-bg-3"
                >
                    <span className="text-text-main font-medium text-sm">Obriši nalog</span>
                    <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
                </button>
            </div>

            <DeactivateAccountModal
                isOpen={showDeactivateModal}
                onClose={() => setShowDeactivateModal(false)}
                onConfirm={handleConfirmDeactivate}
                loading={loading}
                email={user?.email || ""}
            />

            <DeleteAccountModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                loading={loading}
                email={user?.email || ""}
            />
        </div>
    );
}
