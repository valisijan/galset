import { Suspense } from "react";
import { db } from "@/db";
import { adViews, ads as adsTable } from "@/db/schema";
import { eq, count, desc, asc, and, inArray, sql, or, ilike } from "drizzle-orm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import HistoryClient from "./HistoryClient";
import type { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
    title: "Istorija pregleda - Galset",
};

function HistorySkeleton({ viewMode = 'grid' }: { viewMode?: 'grid' | 'list' }) {
    return (
        <div className="max-w-[1000px] mx-auto px-4 md:px-6 pt-2 pb-6 animate-pulse">
            {/* Title Skeleton */}
            <div className="flex justify-center mt-4 mb-2">
                <div className="h-8 bg-bg-3 rounded-full w-48" />
            </div>

            {/* Search Bar Skeleton */}
            <div className="max-w-[800px] mx-auto w-full flex justify-center pt-4 pb-8 md:pt-6 md:pb-12">
                <div className="w-full h-[46px] bg-bg-2 border border-bg-3 rounded-full" />
            </div>

            {/* Ads Skeleton */}
            {viewMode === 'list' ? (
                <div className="flex flex-col gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-bg-2 border border-bg-3 rounded-3xl p-1 md:p-2.5 flex gap-3 md:gap-4 relative overflow-hidden">
                            <div className="w-32 h-32 md:w-40 md:h-40 bg-bg-3 rounded-[20px] md:rounded-2xl shrink-0" />
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
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-bg-2 rounded-3xl border border-bg-3 overflow-hidden flex flex-col h-full">
                            <div className="aspect-[4/3] bg-bg-3" />
                            <div className="p-4 flex-1 space-y-3">
                                <div className="h-5 bg-bg-3 rounded-full w-3/4" />
                                <div className="h-4 bg-bg-3 rounded-full w-1/4" />
                                <div className="mt-auto h-4 bg-bg-3 rounded-full w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

async function HistoryData({ searchParams, viewMode }: { searchParams: any, viewMode: 'grid' | 'list' }) {
    const session = await auth();
    const user = session?.user ? { id: parseInt(session.user.id!) } : null;
    if (!user) redirect("/login");

    const search = searchParams.search || "";
    const sort = searchParams.sort || "Najnovije";
    const adsPerPage = 30;

    let orderByQuery: any = desc(adViews.updatedAt)
    if (sort === "Jeftinije") orderByQuery = asc(adsTable.price)
    else if (sort === "Skuplje") orderByQuery = desc(adsTable.price)

    let adCondition: any = undefined;
    if (search) {
         const matchingAds = await db.query.ads.findMany({
             where: or(ilike(adsTable.title, `%${search}%`), ilike(adsTable.description, `%${search}%`)),
             columns: { id: true }
         });
         const matchIds = matchingAds.map((a: any) => a.id);
         adCondition = matchIds.length > 0 ? inArray(adViews.adId, matchIds) : sql`false`;
    }

    const whereClause: any = search ? and(eq(adViews.userId, user.id), adCondition) : eq(adViews.userId, user.id);

    const [historyItems, totalResult] = await Promise.all([
        db.query.adViews.findMany({
            where: whereClause,
            limit: adsPerPage,
            with: {
                ad: {
                    columns: {
                        id: true,
                        userId: true,
                        title: true,
                        status: true,
                        price: true,
                        currency: true,
                        isPriceOnRequest: true,
                        city: true,
                        createdAt: true,
                        images: true,
                        attributes: true,
                    },
                    with: {
                        user: {
                            columns: {
                                id: true,
                                fullName: true,
                                username: true,
                                profileImg: true,
                            },
                        },
                        promotions: {
                            where: (adPromotions, { gt }) => gt(adPromotions.expiresAt, new Date())
                        }
                    },
                },
            },
            orderBy: [orderByQuery],
        }),
        db.select({ count: count() }).from(adViews).where(whereClause)
    ]);
    const total = Number(totalResult[0].count);

    const fetchedAds = historyItems.map((item: any) => item.ad);
    const serializedAds = JSON.parse(JSON.stringify(fetchedAds));

    return <HistoryClient initialAds={serializedAds} initialTotal={total} initialViewMode={viewMode} />;
}

export default async function HistoryPage(props: { searchParams: Promise<any> }) {
    const searchParams = await props.searchParams;
    const cookieStore = await cookies();
    const viewMode = (cookieStore.get("galset_view_history")?.value || "grid") as 'grid' | 'list';

    return (
        <div className="min-h-screen bg-bg-1 text-text-main">
            <Suspense fallback={<HistorySkeleton viewMode={viewMode} />}>
                <HistoryData searchParams={searchParams} viewMode={viewMode} />
            </Suspense>
        </div>
    );
}
