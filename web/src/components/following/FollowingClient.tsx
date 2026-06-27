"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
const UserAvatar = "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/assets/user-avatar.png";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "lucide-react";
import InfiniteScroll from "../InfiniteScroll";
import UnfollowModal from "../modals/UnfollowModal";

interface User {
    id: number;
    fullName: string;
    username: string;
    profileImg: string | null;
    createdAt: string;
    rating: number;
    ratingCount: number;
}

export default function FollowingClient({ initialUsers }: { initialUsers: User[] }) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(initialUsers.length === 20);
    const [userToUnfollow, setUserToUnfollow] = useState<User | null>(null);
    const router = useRouter();

    const handleCloseModal = () => {
        setUserToUnfollow(null);
    };

    const handleUnfollow = async () => {
        if (!userToUnfollow) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/follow`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ followingId: userToUnfollow.id }),
            });
            const data = await res.json();
            if (data.success && !data.isFollowing) {
                setUsers(prev => prev.filter(u => u.id !== userToUnfollow.id));
                window.dispatchEvent(new Event("followingUpdate"));
                handleCloseModal();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    useEffect(() => {
        const fetchUsers = async () => {
            if (page === 1 && search === "" && initialUsers.length > 0 && users.length === initialUsers.length) {
                return;
            }

            setLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/follow?search=${search}&page=${page}&limit=20`);
                const data = await res.json();
                if (data.success) {
                    if (page === 1) {
                        setUsers(data.users);
                    } else {
                        setUsers(prev => [...prev, ...data.users]);
                    }
                    setHasMore(data.users.length === 20);
                }
            } catch (err) {
                console.error("Error fetching following:", err);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchUsers, search ? 500 : 0);
        return () => clearTimeout(timeoutId);
    }, [search, page]);

    useEffect(() => {
        setPage(1);
        if (search !== "") {
            setUsers([]);
        }
    }, [search]);

    return (
        <div className="w-full text-text-main">
            <h1 className="text-text-main text-xl sm:text-2xl font-bold mt-4 mb-2 text-center">Moja praćenja</h1>

            {/* Search Bar */}
            <div className="max-w-[800px] mx-auto w-full flex justify-center pt-4 pb-8 md:pt-6 md:pb-12">
                <div className="w-full relative">
                    <input
                        type="text"
                        placeholder="Pretraži korisnike"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-bg-2 border border-bg-3 rounded-full py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#6366f1] transition-colors shadow-sm"
                    />
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {users.map((user) => (
                    <div
                        key={user.username}
                        className="flex items-center justify-between p-4 bg-bg-2 border border-bg-3 rounded-3xl transition-all group hover:border-[#555] hover:brightness-110 cursor-pointer"
                        onClick={() => router.push(`/${user.username}`)}
                    >
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-700 overflow-hidden relative shrink-0 border border-bg-3">
                                <Image
                                    src={user.profileImg?.split("|||")[0] || UserAvatar}
                                    alt={user.username}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <h3 className="text-white font-bold text-base md:text-lg truncate transition-colors">{user.fullName}</h3>
                                <p className="text-gray-400 text-xs md:text-sm">@{user.username}</p>
                            </div>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setUserToUnfollow(user);
                            }}
                            className="shrink-0 px-4 py-2 bg-bg-3 text-text-main hover:bg-bg-4 rounded-xl text-text-main font-bold text-xs md:text-sm transition-all cursor-pointer"
                        >
                            Pratite
                        </button>
                    </div>
                ))}

                {users.length === 0 && !loading && (
                    (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-bg-2 rounded-full flex items-center justify-center mx-auto mb-4">
                                <User className="w-8 h-8 text-gray-500" />
                            </div>
                            <h3 className="text-lg font-bold">Nema praćenja</h3>
                            <p className="text-gray-400 text-sm mt-1">
                                {search ? "Nismo pronašli korisnike koji odgovaraju pretrazi." : "Još uvek ne pratite nikoga."}
                            </p>
                            {!search && (
                                <Link href="/search/users" className="mt-6 inline-block bg-bg-2 hover:bg-bg-3 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                                    Istraži korisnike
                                </Link>
                            )}
                        </div>
                    )
                )}

                {/* Infinite Scroll */}
                <InfiniteScroll
                    loadMore={() => setPage(prev => prev + 1)}
                    hasMore={hasMore}
                    isLoading={loading}
                />
            </div>

            {/* Modal */}
            <UnfollowModal
                isOpen={!!userToUnfollow}
                onClose={handleCloseModal}
                onConfirm={handleUnfollow}
                username={userToUnfollow?.username}
            />
        </div>
    );
}
