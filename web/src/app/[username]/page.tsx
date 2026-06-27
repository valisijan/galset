import { db } from "@/db";
import { users, reviews, userFollows, ads, sales, wishlists } from "@/db/schema";
import { eq, count, avg, and, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import UserPageClient from "@/components/UserProfile";
import { auth } from "@/auth";
import { fetchAdsServer } from "@/lib/fetch-ads";
import type { Metadata } from "next";

type Props = {
    params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { username } = await params;
    return {
        title: `${username} - Galset`,
    };
}

export default async function UserPage({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const { username } = await params;

    const user = await db.query.users.findFirst({
        where: eq(sql`lower(${users.username})`, username.toLowerCase()),
        columns: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            profileImg: true,
            createdAt: true,
            country: true,
            city: true,
            description: true,
        }
    });

    if (!user) {
        return notFound();
    }

    const [successfulSalesResult] = await db.select({
        count: count()
    }).from(sales).where(eq(sales.sellerId, user.id));

    const successfulSales = successfulSalesResult?.count ? Number(successfulSalesResult.count) : 0;

    const userWithStats = {
        ...user,
        successfulSales
    };

    const [statsResult] = await db.select({
        reviewsCount: count(),
        averageRating: avg(reviews.rating)
    }).from(reviews).where(eq(reviews.userId, user.id));

    const reviewsStats = {
        count: statsResult?.reviewsCount ? Number(statsResult.reviewsCount) : 0,
        avg: statsResult?.averageRating ? Number(statsResult.averageRating) : 0
    };

    const [followersResult] = await db.select({
        count: count()
    }).from(userFollows).where(eq(userFollows.followingId, user.id));

    const followersCount = followersResult?.count ? Number(followersResult.count) : 0;

    const [adsResult] = await db.select({
        count: count()
    }).from(ads).where(eq(ads.userId, user.id));

    const adsCount = adsResult?.count ? Number(adsResult.count) : 0;

    let isFollowing = false;
    let isOwnProfile = false;
    const session = await auth();
    const currentUser = session?.user;
    if (currentUser && currentUser.id) {
        const followerId = parseInt(currentUser.id);

        if (followerId === user.id) {
            isOwnProfile = true;
        } else {
            const follow = await db.query.userFollows.findFirst({
                where: and(
                    eq(userFollows.followerId, followerId),
                    eq(userFollows.followingId, user.id)
                )
            });
            isFollowing = !!follow;
        }
    }

    const currentUserId = currentUser?.id ? parseInt(currentUser.id) : null;
    const fetchParams = currentUserId
        ? { userId: user.id, status: "ACTIVE", currentUserId }
        : { userId: user.id, status: "ACTIVE" };

    const { ads: initialAds, total: initialTotal } = await fetchAdsServer(fetchParams);

    let initialWishlistIds: number[] = [];
    if (currentUserId) {
        const wishlistData = await db.query.wishlists.findMany({
            where: eq(wishlists.userId, currentUserId),
            columns: { adId: true }
        });
        initialWishlistIds = wishlistData.map(w => w.adId);
    }

    return (
        <UserPageClient
            user={userWithStats as any}
            isFollowingInitial={isFollowing}
            isOwnProfile={isOwnProfile}
            reviewsStats={reviewsStats}
            initialFollowersCount={followersCount}
            initialAdsCount={adsCount}
            initialAds={initialAds}
            initialWishlistIds={initialWishlistIds}
            initialTotal={initialTotal}
        />
    );
}
