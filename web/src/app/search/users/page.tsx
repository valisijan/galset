"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useFilters } from "@/components/filters/useFilters";
import Avatar from "@/components/Avatar";
import SearchModeToggle from "@/components/SearchModeToggle";
import InfiniteScroll from "@/components/InfiniteScroll";
import UnfollowModal from "@/components/modals/UnfollowModal";
import SearchBar from "@/components/SearchBar";

function UserSkeletonCard() {
    return (
        <div className="bg-bg-2 p-4 rounded-3xl border border-bg-3 animate-pulse flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-14 h-14 rounded-full bg-bg-3 shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-bg-3 rounded w-1/2" />
                    <div className="h-3 bg-bg-3 rounded w-1/4" />
                </div>
            </div>
            <div className="w-20 h-9 rounded-xl bg-bg-3 shrink-0" />
        </div>
    );
}

function SearchUsersSkeleton() {
    return (
        <div className="w-full min-h-screen bg-bg-1 text-text-main">
            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 pt-2 pb-6">
                <div className="w-full">
                    <div className="w-full flex justify-center pt-4 pb-8 md:pt-6 md:pb-12">
                        <div className="w-full max-w-2xl h-14 bg-bg-2 rounded-full animate-pulse" />
                    </div>
                    <div className="flex justify-center mb-10 -mt-4 md:-mt-8">
                        <div className="w-[300px] h-12 bg-bg-2 rounded-full animate-pulse" />
                    </div>
                    <div className="mb-10">
                        <div className="h-7 w-48 bg-bg-2 rounded mb-6 animate-pulse" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[...Array(12)].map((_, i) => (
                                <UserSkeletonCard key={i} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SearchUsersContent() {
    const { params, setSingle } = useFilters();
    const { user } = useAuth();
    const [q, setQ] = useState(params["q"] || "");
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 44;
    const router = useRouter();

    const [userToUnfollow, setUserToUnfollow] = useState<any>(null);

    const handleToggleFollow = async (e: React.MouseEvent, userToToggle: any) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            router.push("/auth");
            return;
        }

        if (userToToggle.isFollowing) {
            setUserToUnfollow(userToToggle);
        } else {
            await performFollowAction(userToToggle.id);
        }
    };

    const performFollowAction = async (targetUserId: number) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/follow`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ followingId: targetUserId }),
            });
            const data = await res.json();
            if (data.success) {
                setUsers(prev => prev.map(u =>
                    u.id === targetUserId ? { ...u, isFollowing: data.isFollowing } : u
                ));
            }
        } catch (err) {
            console.error("Follow error:", err);
        }
    };

    const handleConfirmUnfollow = async () => {
        if (!userToUnfollow) return;
        await performFollowAction(userToUnfollow.id);
        setUserToUnfollow(null);
    };

    useEffect(() => {
        setQ(params["q"] || "");
        setUsers([]);
        setPage(1);
        setHasMore(true);
    }, [params]);

    const fetchUsers = useCallback(async (pageNum: number, searchQuery: string) => {
        if (loading) return;
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?limit=${LIMIT}&page=${pageNum}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`);
            const data = await res.json();
            if (data.success) {
                if (pageNum === 1) {
                    setUsers(data.users);
                } else {
                    setUsers(prev => {
                        const existingIds = prev.map(u => u.id);
                        const newOnes = data.users.filter((u: any) => !existingIds.includes(u.id));
                        return [...prev, ...newOnes];
                    });
                }
                setHasMore(data.users.length === LIMIT && (pageNum * LIMIT) < data.total);
            }
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoading(false);
        }
    }, [loading]);

    useEffect(() => {
        fetchUsers(1, q);
    }, [q]);

    const loadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchUsers(nextPage, q);
        }
    };

    const handleSearch = (term?: string) => {
        const searchValue = term !== undefined ? term : q;
        if (searchValue.trim()) {
            router.push(`/search/users?q=${encodeURIComponent(searchValue.trim())}`);
        } else {
            router.push(`/search/users`);
        }
    };

    return (
        <div className="w-full min-h-screen bg-bg-1 text-text-main">
            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 pt-2 pb-6">
                <div className="w-full">
                    {/* CENTERED SEARCH BAR */}
                    <div className="w-full flex justify-center pt-4 pb-8 md:pt-6 md:pb-12">
                        <SearchBar
                            value={q}
                            onChange={setQ}
                            onSearch={handleSearch}
                            placeholder="Pretraži korisnike..."
                            storageKey="galset_users_search_history"
                            hideButton={true}
                        />
                    </div>

                    {/* SEARCH MODE TOGGLE */}
                    <div className="flex justify-center mb-10 -mt-4 md:-mt-8">
                        <SearchModeToggle activeMode="users" />
                    </div>

                    {/* USERS GRID */}
                    <div className="mb-10">
                        <h2 className="text-text-main text-xl sm:text-2xl font-bold mb-6">Popularni korisnici</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {users.map((u) => (
                                <div
                                    key={u.id}
                                    onClick={() => router.push(`/${u.username || u.id}`)}
                                    className="bg-bg-2 p-4 rounded-3xl border border-bg-3 hover:border-[#555] hover:brightness-110 transition-all flex items-center justify-between gap-4 relative overflow-hidden group/card cursor-pointer"
                                >
                                    <div className="flex items-center gap-4 min-w-0 flex-1">
                                        <div className="relative z-10">
                                            <Avatar
                                                imageUrl={u.profileImg}
                                                name={u.fullName || u.username}
                                                size={56}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0 relative z-10">
                                            <h3 className="text-text-main font-bold truncate transition-colors">
                                                {u.fullName || "Korisnik"}
                                            </h3>
                                            <p className="text-gray-400 text-sm truncate">@{u.username || "korisnik"}</p>
                                        </div>
                                    </div>

                                    {u.id !== (user?.id ? parseInt(user.id) : null) && (
                                        <div className="relative z-10 shrink-0">
                                            <button
                                                onClick={(e) => handleToggleFollow(e, u)}
                                                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer border-none ${u.isFollowing
                                                    ? "bg-bg-3 text-text-main hover:bg-bg-4"
                                                    : "bg-[#5b42f3] text-white hover:bg-[#4b35d6]"
                                                    }`}
                                            >
                                                {u.isFollowing ? "Pratite" : "Prati"}
                                            </button>
                                        </div>
                                    )}


                                </div>
                            ))}

                            {loading && page === 1 && (
                                [...Array(8)].map((_, i) => (
                                    <UserSkeletonCard key={`skeleton-${i}`} />
                                ))
                            )}

                            {loading && page > 1 && (
                                [...Array(24)].map((_, i) => (
                                    <UserSkeletonCard key={`more-skeleton-${i}`} />
                                ))
                            )}
                        </div>

                        {users.length === 0 && !loading && (
                            <div className="w-full py-20 text-center">
                                <p className="text-gray-500">Nije pronađen nijedan korisnik za upit "{q}"</p>
                            </div>
                        )}

                        {/* INFINITE SCROLL - skeleton kartice se prikazuju umesto Loader-a */}
                        {!(loading && page === 1) && (
                            <InfiniteScroll
                                loadMore={loadMore}
                                hasMore={hasMore}
                                isLoading={loading}
                                hideLoader={true}
                            />
                        )}
                    </div>
                </div>
            </div>

            <UnfollowModal
                isOpen={!!userToUnfollow}
                onClose={() => setUserToUnfollow(null)}
                onConfirm={handleConfirmUnfollow}
                username={userToUnfollow?.fullName || userToUnfollow?.username}
            />
        </div>
    );
}

export default function SearchUsersPage() {
    return (
        <Suspense fallback={<SearchUsersSkeleton />}>
            <SearchUsersContent />
        </Suspense>
    );
}
