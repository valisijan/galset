"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
const UserAvatar = "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/assets/user-avatar.png?updatedAt=1776365714850";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserX, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import UnblockUserModal from "@/components/modals/UnblockUserModal";
import { useAuth } from "@/context/AuthContext";

interface BlockedUser {
    id: number;
    username: string | null;
    fullName: string | null;
    profileImg: string | null;
}

export default function BlockedUsersSettingsPage() {
    const { sessionToken } = useAuth();
    const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [userToUnblock, setUserToUnblock] = useState<BlockedUser | null>(null);
    const [unblockLoading, setUnblockLoading] = useState(false);

    useEffect(() => {
        const fetchBlocked = async () => {
            if (!sessionToken) return;
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/block/list`);
                const data = await res.json();
                if (data.success) {
                    setBlockedUsers(data.blockedUsers);
                }
            } catch (e) {
                toast.error("Greška pri učitavanju blokiranih korisnika");
            } finally {
                setLoading(false);
            }
        };
        if (sessionToken) {
            fetchBlocked();
        }
    }, [sessionToken]);

    const handleUnblock = async () => {
        if (!userToUnblock) return;
        setUnblockLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/block`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ blockedId: userToUnblock.id }),
            });
            const data = await res.json();
            if (data.success) {
                setBlockedUsers(prev => prev.filter(u => u.id !== userToUnblock.id));
                toast.success(`Korisnik ${userToUnblock.username} je odblokiran`);
                setUserToUnblock(null);
            } else {
                toast.error("Greška pri odblokiranju");
            }
        } catch (e) {
            toast.error("Greška, pokušajte ponovo");
        } finally {
            setUnblockLoading(false);
        }
    };

    return (
        <div className="w-full relative pb-20">
            <h1 className="text-2xl font-bold text-text-main mb-8 text-center">Blokirani korisnici</h1>

            {loading ? (
                <div className="flex flex-col gap-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 py-4 px-5 bg-bg-2 rounded-3xl animate-pulse">
                            <div className="w-12 h-12 rounded-full bg-bg-3 shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-bg-3 rounded w-1/3" />
                                <div className="h-3 bg-bg-3 rounded w-1/4" />
                            </div>
                            <div className="h-9 w-28 bg-bg-3 rounded-xl" />
                        </div>
                    ))}
                </div>
            ) : blockedUsers.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-16">Nema blokiranih korisnika.</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {blockedUsers.map((u) => (
                        <div key={u.id} className="flex items-center gap-4 py-4 px-5 bg-bg-2 rounded-3xl border border-bg-3 hover:bg-bg-3 transition-colors">
                            <Link href={`/${u.username}`} className="shrink-0">
                                <div className="w-12 h-12 rounded-full overflow-hidden relative">
                                    <Image
                                        src={u.profileImg?.split("|||")[0] || UserAvatar}
                                        alt={u.fullName || u.username || "Korisnik"}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </Link>
                            <div className="flex-1 min-w-0">
                                <Link href={`/${u.username}`}>
                                    <p className="text-text-main font-semibold text-sm truncate transition-colors">
                                        {u.fullName || u.username || "Korisnik"}
                                    </p>
                                    <p className="text-gray-400 text-xs truncate">{u.username}</p>
                                </Link>
                            </div>
                            <button
                                onClick={() => setUserToUnblock(u)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-3 hover:bg-bg-4 text-text-main text-sm font-medium transition-colors cursor-pointer shrink-0 border border-bg-3 hover:border-gray-600"
                            >
                                Odblokiraj
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Unblock Confirmation Modal */}
            <UnblockUserModal
                isOpen={!!userToUnblock}
                onClose={() => setUserToUnblock(null)}
                onConfirm={handleUnblock}
                username={userToUnblock?.username || ""}
                profileImg={userToUnblock?.profileImg}
                loading={unblockLoading}
            />
        </div>
    );
}
