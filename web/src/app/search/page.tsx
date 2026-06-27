import { Suspense } from "react";
import { auth } from "@/auth";
import { db } from "@/db";
import { wishlists } from "@/db/schema";
import { eq } from "drizzle-orm";
import { fetchAdsServer } from "@/lib/fetch-ads";
import { getCategoriesTreeCached } from "@/lib/categories";
import SearchClient from "./SearchClient";
import SearchSkeleton from "./SearchSkeleton";
import { cookies } from "next/headers";

async function fetchFilterDataCached(url: string) {
    try {
        const res = await fetch(url, { next: { revalidate: 3600 } });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

async function SearchData({ searchParams, viewMode }: { searchParams: any; viewMode: 'grid' | 'list' }) {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;
    const fetchParams = userId ? { ...searchParams, currentUserId: userId } : searchParams;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "";

    const [
        { ads: initialAds, total: initialTotal },
        categories,
        initialFiltersData,
        initialUseFiltersData,
    ] = await Promise.all([
        fetchAdsServer(fetchParams),
        getCategoriesTreeCached(),
        fetchFilterDataCached(`${apiUrl}/data/filters-data.json`),
        fetchFilterDataCached(`${apiUrl}/data/filters/use-filters.json`),
    ]);

    let initialWishlistIds: number[] = [];
    if (userId) {
        const wishlistData = await db.query.wishlists.findMany({
            where: eq(wishlists.userId, userId),
            columns: { adId: true }
        });
        initialWishlistIds = wishlistData.map(w => w.adId);
    }

    return (
        <SearchClient
            initialAds={initialAds}
            initialWishlistIds={initialWishlistIds}
            initialTotal={initialTotal}
            user={session?.user || null}
            categories={categories}
            initialViewMode={viewMode}
            initialFiltersData={Array.isArray(initialFiltersData) ? initialFiltersData : undefined}
            initialUseFiltersData={initialUseFiltersData && !initialUseFiltersData.error ? initialUseFiltersData : undefined}
        />
    );
}

export default async function SearchPage(props: { searchParams: Promise<any> }) {
    const searchParams = await props.searchParams;
    const isSimpleSearch = Object.keys(searchParams).length === 0;

    const cookieStore = await cookies();
    const viewMode = (cookieStore.get("galset_view_search")?.value || "grid") as 'grid' | 'list';

    return (
        <Suspense fallback={<SearchSkeleton isSimpleSearch={isSimpleSearch} viewMode={viewMode} />}>
            <SearchData searchParams={searchParams} viewMode={viewMode} />
        </Suspense>
    );
}
