import { db } from "@/db";
import { users, reviews, userFollows, ads } from "@/db/schema";
import { eq, count, avg, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import UserPageClient from "@/components/UserProfile";
import FollowersClient from "./FollowersClient";
import { auth } from "@/auth";

import type { Metadata } from "next";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ username: string }>;
}): Promise<Metadata> {
    const { username } = await params;
    return {
        title: `Pratioci korisnika ${username} - Galset`,
    };
}

export default async function FollowersPage({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const { username } = await params;

    const user = await db.query.users.findFirst({
        where: eq(users.username, username),
        columns: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            profileImg: true,
            createdAt: true,
            country: true,
            description: true,
        }
    });

    if (!user) {
        return notFound();
    }

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
    let currentUserId: number | null = null;
    let currentUserFollowingIds: number[] = [];

    const session = await auth();
    const currentUser = session?.user;
    if (currentUser && currentUser.id) {
        currentUserId = parseInt(currentUser.id);

        if (currentUserId === user.id) {
            isOwnProfile = true;
        } else {
            const follow = await db.query.userFollows.findFirst({
                where: and(
                    eq(userFollows.followerId, currentUserId),
                    eq(userFollows.followingId, user.id)
                )
            });
            isFollowing = !!follow;
        }

        const followingList = await db.select({
            followingId: userFollows.followingId
        })
            .from(userFollows)
            .where(eq(userFollows.followerId, currentUserId));

        currentUserFollowingIds = followingList.map(f => f.followingId);
    }

    const followers = await db.select({
        id: users.id,
        fullName: users.fullName,
        username: users.username,
        profileImg: users.profileImg,
    })
        .from(userFollows)
        .innerJoin(users, eq(userFollows.followerId, users.id))
        .where(eq(userFollows.followingId, user.id));

    return (
        <FollowersClient
            followers={followers}
            currentUserFollowingIds={currentUserFollowingIds}
            profileUser={{
                fullName: user.fullName,
                username: user.username,
                profileImg: user.profileImg
            }}
            currentUserId={currentUserId}
        />
    );
}
