import { db } from "@/db";
import { users, reviews as reviewsTable, ads, sales } from "@/db/schema";
import { eq, desc, count, avg, and } from "drizzle-orm";
import { auth } from "@/auth";
import Image from "next/image";
import Link from "next/link";
const UserAvatar = "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/assets/user-avatar.png?updatedAt=1776365714850";
import StarRating from "@/components/reviews/StarRating";
import ReviewAndMoreButtons from "@/components/reviews/ReviewAndMoreButtons";
import ReviewsClient from "@/components/reviews/ReviewsClient";

const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("sr-RS", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
};

interface DecodedToken {
    id: number;
    email: string;
    fullName: string;
    username: string;
    iat: number;
    exp: number;
}

import type { Metadata } from "next";

type Props = {
    params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { username } = await params;
    return {
        title: `Ocene korisnika ${username} - Galset`,
    };
}

export default async function ReviewsPage({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const { username } = await params;
    const session = await auth();
    const currentUser = session?.user ? { ...session.user, id: parseInt(session.user.id!) } : null;

    const targetUserQuery = await db.query.users.findFirst({
        where: eq(users.username, username),
        columns: {
            id: true,
            fullName: true,
            username: true,
            profileImg: true,
            createdAt: true,
            country: true,
            city: true,
        },
    });

    if (!targetUserQuery) {
        return <div className="p-10 text-text-main text-center">User not found</div>;
    }

    const [successfulSalesResult] = await db.select({
        count: count()
    }).from(sales).where(eq(sales.sellerId, targetUserQuery.id));

    const successfulSales = successfulSalesResult?.count ? Number(successfulSalesResult.count) : 0;

    const targetUser = {
        ...targetUserQuery,
        successfulSales
    };

    const targetUserId = targetUser.id;

    const reviews = await db.query.reviews.findMany({
        where: eq(reviewsTable.userId, targetUserId),
        with: {
            reviewer: {
                columns: {
                    id: true,
                    fullName: true,
                    username: true,
                    profileImg: true,
                    email: true,
                },
            },
        },
        orderBy: [desc(reviewsTable.createdAt)],
        limit: 10,
    });

    const [statsResult] = await db.select({
        totalCount: count(),
        averageRating: avg(reviewsTable.rating)
    }).from(reviewsTable).where(eq(reviewsTable.userId, targetUserId));

    const totalCount = statsResult?.totalCount ? Number(statsResult.totalCount) : 0;
    const averageRating = statsResult?.averageRating ? Number(statsResult.averageRating) : 0;

    const joinedDate = new Date(targetUser.createdAt);
    const formattedJoinedDate = `${(joinedDate.getMonth() + 1).toString().padStart(2, '0')}/${joinedDate.getFullYear()}`;

    const initialReviews = reviews.map(r => ({
        ...r,
        createdAt: r.createdAt.toISOString()
    }));

    return (
        <div className="min-h-screen bg-bg-1 text-text-main flex justify-center">
            <div className="w-full max-w-[800px] px-4 pt-2 pb-6 flex flex-col gap-8">

                {/* HEADER SECTION */}
                <h1 className="text-text-main text-xl sm:text-2xl font-bold mt-4 mb-2 text-center">Ocene</h1>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex flex-col gap-6 flex-1">

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* USER INFO */}
                            <div className="items-center gap-4 flex transition">
                                <Link href={`/${targetUser.username}`} className="flex items-center gap-4">
                                    <div className="w-16 h-16 md:w-20 md:h-20 relative rounded-full overflow-hidden bg-bg-2">
                                        <Image
                                            src={(targetUser.profileImg || "").split("|||")[0] || UserAvatar}
                                            alt={targetUser.fullName || targetUser.username || "Korisnik"}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-bold text-text-main">{targetUser.fullName}</h2>
                                        <p className="text-gray-400 text-sm md:text-base">{targetUser.username}</p>
                                    </div>
                                </Link>
                            </div>

                            {/* STATS - TOP RIGHT ON DESKTOP */}
                            <div className="flex flex-col items-start md:items-end gap-3">
                                <div className="flex items-center gap-4 bg-bg-1 md:bg-transparent p-4 md:p-0 rounded-2xl">
                                    <StarRating rating={Math.round(averageRating)} />
                                    <div className="flex items-center gap-2 text-gray-300 font-medium text-lg">
                                        <span>{averageRating.toFixed(1)}</span>
                                        <span className="text-gray-600">-</span>
                                        <span>{totalCount} ocena</span>
                                    </div>
                                </div>
                                <div className="hidden md:block">
                                    <ReviewAndMoreButtons
                                        targetUser={targetUser}
                                        currentUserId={currentUser?.id ? Number(currentUser.id) : null}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="md:hidden mt-2">
                        <ReviewAndMoreButtons
                            targetUser={targetUser}
                            currentUserId={currentUser?.id ? Number(currentUser.id) : null}
                        />
                    </div>
                </div>

                {/* REVIEWS LIST */}
                <ReviewsClient
                    targetUserId={targetUserId}
                    initialReviews={initialReviews as any}
                    currentUserId={currentUser?.id ? Number(currentUser.id) : null}
                />

            </div>
        </div>
    );
}
