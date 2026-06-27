import { db } from "@/db";
import { userFollows } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/auth";
import FollowingClient from "@/components/following/FollowingClient";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

function FollowingSkeleton() {
    return (
        <div className="w-full animate-pulse">
            {/* Title Skeleton */}
            <div className="flex justify-center mt-4 mb-2">
                <div className="h-8 bg-bg-3 rounded-full w-48" />
            </div>

            {/* Search Bar Skeleton */}
            <div className="max-w-[800px] mx-auto w-full flex justify-center pt-4 pb-8 md:pt-6 md:pb-12">
                <div className="w-full h-[46px] bg-bg-2 border border-bg-3 rounded-full" />
            </div>

            {/* Cards Skeleton */}
            <div className="flex flex-col gap-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-bg-2 rounded-3xl border border-bg-3">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-bg-3 rounded-full" />
                            <div className="space-y-2">
                                <div className="h-5 bg-bg-3 rounded w-32" />
                                <div className="h-4 bg-bg-3 rounded w-24" />
                            </div>
                        </div>
                        <div className="w-20 h-9 bg-bg-3 rounded-xl" />
                    </div>
                ))}
            </div>
        </div>
    );
}

async function FollowingList({ userId }: { userId: number }) {
    const following = await db.query.userFollows.findMany({
        where: eq(userFollows.followerId, userId),
        with: {
            following: {
                columns: {
                    id: true,
                    fullName: true,
                    username: true,
                    profileImg: true,
                    createdAt: true,
                },
                with: {
                    reviewsReceived: {
                        columns: {
                            rating: true
                        }
                    }
                }
            }
        },
        orderBy: [desc(userFollows.createdAt)]
    });

    const users = following.map(f => {
        const reviews = (f as any).following?.reviewsReceived || [];
        const ratingCount = reviews.length;
        const rating = ratingCount > 0
            ? reviews.reduce((acc: any, rev: any) => acc + rev.rating, 0) / ratingCount
            : 0;

        return {
            id: (f as any).following.id,
            fullName: (f as any).following.fullName,
            username: (f as any).following.username,
            profileImg: (f as any).following.profileImg,
            createdAt: (f as any).following.createdAt.toISOString(),
            rating: parseFloat(rating.toFixed(1)),
            ratingCount
        };
    });

    return <FollowingClient initialUsers={users} />;
}

export default async function FollowingPage() {
    const session = await auth();
    const currentUser = session?.user;

    if (!currentUser || !currentUser.id) {
        redirect("/auth");
    }

    const userId = parseInt(currentUser.id);

    return (
        <div className="min-h-screen bg-bg-1 flex justify-center">
            <div className="w-full max-w-[800px] px-4 pt-2 pb-6">
                <Suspense fallback={<FollowingSkeleton />}>
                    <FollowingList userId={userId} />
                </Suspense>
            </div>
        </div>
    );
}
