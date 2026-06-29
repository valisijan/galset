import { Suspense } from "react";
import { db } from "@/db";
import { ads as adsTable, drafts as draftsTable } from "@/db/schema";
import { eq, count, desc, asc, and, ilike, or, sql, lt, gt } from "drizzle-orm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import MyAdsClient from "../MyAdsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Moji oglasi - Galset",
};

function MyAdsSkeleton() {
    return (
        <div className="max-w-[800px] mx-auto px-4 pt-2 pb-8 animate-pulse">
            {/* Title Skeleton */}
            <div className="flex justify-center mt-4 mb-2">
                <div className="h-8 bg-bg-3 rounded-full w-48" />
            </div>

            {/* Status Tabs Skeleton */}
            <div className="pt-4 md:pt-6 mb-8 flex justify-center">
                <div className="bg-bg-2 p-1 rounded-full border border-bg-3 relative overflow-x-auto no-scrollbar w-fit max-w-full mx-auto md:overflow-visible">
                    <div className="flex w-fit mx-auto gap-1">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-8 w-[80px] sm:w-[96px] bg-bg-3 rounded-full"
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Search Bar Skeleton */}
            <div className="w-full h-[46px] bg-bg-2 border border-bg-3 rounded-full mb-8" />

            {/* Ads List Skeleton */}
            <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-bg-2 border border-bg-3 rounded-3xl p-1 md:p-2.5 flex gap-3 md:gap-4 relative overflow-hidden">
                        {/* Image Skeleton */}
                        <div className="w-32 h-32 md:w-40 md:h-40 bg-bg-3 rounded-[20px] md:rounded-2xl shrink-0" />
                        
                        {/* Content Skeleton */}
                        <div className="flex-1 flex flex-col justify-between py-1">
                            <div className="space-y-2">
                                <div className="h-5 bg-bg-3 rounded-full w-3/4" />
                                <div className="h-4 bg-bg-3 rounded-full w-1/4" />
                            </div>
                            <div className="space-y-1.5 mt-auto">
                                <div className="h-3 bg-bg-3 rounded-full w-1/2" />
                                <div className="h-3 bg-bg-3 rounded-full w-1/3" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

async function MyAdsData({ action, searchParams }: { action: string; searchParams: any }) {
    const session = await auth();
    const user = session?.user ? { id: parseInt(session.user.id!) } : null;
    if (!user) redirect("/login");

    const search = searchParams.search || "";
    const sort = searchParams.sort || "Najnovije";
    const adsPerPage = 30;

    const statusMap: Record<string, any> = {
        "active": "ACTIVE",
        "expired": "EXPIRED",
        "deactivated": "DEACTIVATED",
        "deleted": "DELETED",
        "draft": "DRAFT"
    };
    const status = statusMap[action] || "ACTIVE";

    let apiSort: any = desc(adsTable.createdAt);
    if (sort === "Jeftinije") apiSort = asc(adsTable.price);
    else if (sort === "Skuplje") apiSort = desc(adsTable.price);
    
    // Auto-expire ads for this user before fetching
    const now = new Date();
    await db.update(adsTable)
        .set({ status: "EXPIRED" })
        .where(and(
            eq(adsTable.userId, user.id),
            eq(adsTable.status, "ACTIVE"),
            lt(adsTable.expiresAt, now)
        ));

    let baseCondition;
    if (status === "ACTIVE") {
        baseCondition = and(eq(adsTable.userId, user.id), eq(adsTable.status, "ACTIVE"), gt(adsTable.expiresAt, now));
    } else if (status === "EXPIRED") {
        baseCondition = and(
            eq(adsTable.userId, user.id),
            or(
                eq(adsTable.status, "EXPIRED"),
                and(eq(adsTable.status, "ACTIVE"), lt(adsTable.expiresAt, now))
            )
        );
    } else {
        baseCondition = and(eq(adsTable.userId, user.id), eq(adsTable.status, status));
    }
    const searchCondition = search
        ? or(ilike(adsTable.title, `%${search}%`), ilike(adsTable.description, `%${search}%`))
        : undefined;
    const finalCondition: any = search ? and(baseCondition, searchCondition) : baseCondition;

    // Draft tab: fetch only drafts
    if (status === "DRAFT") {
        const fetchedDrafts = await db.query.drafts.findMany({
            where: eq(draftsTable.userId, user.id),
            columns: {
                id: true,
                title: true,
                price: true,
                currency: true,
                isPriceOnRequest: true,
                city: true,
                createdAt: true,
                images: true,
                userId: true,
            },
            orderBy: [desc(draftsTable.createdAt)]
        });

        const formattedDrafts = fetchedDrafts.map(d => ({
            ...d,
            status: "DRAFT",
            isReserved: false,
            viewscount: 0,
            wishlistcount: 0,
            messagescount: 0,
            user: { id: user.id, fullName: "", username: "", profileImg: null },
            promotions: []
        }));

        const serializedDrafts = JSON.parse(JSON.stringify(formattedDrafts));
        return <MyAdsClient initialAds={serializedDrafts} initialTotal={formattedDrafts.length} action={action} />;
    }

    const [fetchedAds, totalResult] = await Promise.all([
        db.query.ads.findMany({
            where: finalCondition,
            columns: {
                id: true,
                title: true,
                status: true,
                price: true,
                currency: true,
                isPriceOnRequest: true,
                city: true,
                createdAt: true,
                images: true,
                userId: true,
                isReserved: true,
            },
            extras: {
                viewscount: sql<number>`(SELECT count(*) FROM "AdView" WHERE "AdView"."adId" = "ads"."id")::int`.as('viewscount'),
                wishlistcount: sql<number>`(SELECT count(*) FROM "Wishlist" WHERE "Wishlist"."adId" = "ads"."id")::int`.as('wishlistcount'),
                messagescount: sql<number>`(SELECT count(*) FROM "Chat" WHERE "Chat"."adId" = "ads"."id")::int`.as('messagescount'),
            },
            with: {
                user: {
                    columns: {
                        id: true,
                        fullName: true,
                        username: true,
                        profileImg: true
                    }
                },
                promotions: {
                    where: (adPromotions, { gt }) => gt(adPromotions.expiresAt, new Date())
                }
            },
            orderBy: [apiSort],
            limit: adsPerPage,
        }),
        db.select({ count: count() }).from(adsTable).where(finalCondition),
    ]);

    const serializedAds = JSON.parse(JSON.stringify(fetchedAds));
    const total = Number(totalResult[0].count);

    return <MyAdsClient initialAds={serializedAds} initialTotal={total} action={action} />;
}

export default async function MyAdsPage(props: { params: Promise<{ action: string }>; searchParams: Promise<any> }) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const action = params.action;

    const validActions = ["active", "deactivated", "draft", "expired"];
    if (!validActions.includes(action)) {
        redirect("/my-ads/active");
    }

    return (
        <div className="min-h-screen bg-bg-1 text-text-main">
            <Suspense fallback={<MyAdsSkeleton />}>
                <MyAdsData action={action} searchParams={searchParams} />
            </Suspense>
        </div>
    );
}
