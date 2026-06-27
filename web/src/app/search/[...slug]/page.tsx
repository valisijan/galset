import { Suspense } from "react";
import { auth } from "@/auth";
import { db } from "@/db";
import { wishlists } from "@/db/schema";
import { eq } from "drizzle-orm";
import { fetchAdsServer } from "@/lib/fetch-ads";
import SearchCategoryClient from "./SearchCategoryClient";
import { getCategoriesTreeCached } from "@/lib/categories";
import SearchSkeleton from "../SearchSkeleton";
import { cookies } from "next/headers";

interface Category {
    id: number;
    name: string;
    slug?: string;
    subslug?: string;
    childslug?: string;
    subcategories?: Category[];
}

function findCategoryBySlug(cats: Category[], targetSlug: string): Category | null {
    for (const cat of cats) {
        const slug = cat.slug || cat.subslug || cat.childslug;
        if (slug === targetSlug) return cat;
        if (cat.subcategories) {
            const found = findCategoryBySlug(cat.subcategories, targetSlug);
            if (found) return found;
        }
    }
    return null;
}

export default async function SearchCategoryPage(props: { params: Promise<{ slug: string[] }>, searchParams: Promise<any> }) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    const slugArr = Array.isArray(params.slug) ? params.slug : [params.slug];
    const currentSlug = slugArr[slugArr.length - 1];
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "";

    // Initial fetch of ads based on current slug and search params
    const fetchParamsObj: any = {
        ...searchParams,
        category: currentSlug
    };
    if (userId) {
        fetchParamsObj.currentUserId = userId;
    }

    // Fetch all data in parallel
    let categories: Category[] = [];
    const [
        { ads: initialAds, total: initialTotal },
        initialFiltersDataRaw,
        initialUseFiltersDataRaw,
    ] = await Promise.all([
        fetchAdsServer(fetchParamsObj),
        fetch(`${apiUrl}/data/filters-data.json`, { next: { revalidate: 3600 } }).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${apiUrl}/data/filters/use-filters.json`, { next: { revalidate: 3600 } }).then(r => r.ok ? r.json() : null).catch(() => null),
    ]);

    // Find category ID server-side
    let categoryId: number | undefined = undefined;
    try {
        categories = await getCategoriesTreeCached();
        const found = findCategoryBySlug(categories, currentSlug);
        if (found) categoryId = found.id;
    } catch (e) {
        console.error("Error loading categories in SearchCategoryPage:", e);
    }

    // Initial fetch of wishlist if logged in
    let initialWishlistIds: number[] = [];
    if (userId) {
        const wishlistData = await db.query.wishlists.findMany({
            where: eq(wishlists.userId, userId),
            columns: { adId: true }
        });
        initialWishlistIds = wishlistData.map(w => w.adId);
    }

    const cookieStore = await cookies();
    const viewMode = (cookieStore.get("galset_view_search")?.value || "grid") as 'grid' | 'list';

    return (
        <Suspense fallback={<SearchSkeleton isSimpleSearch={false} viewMode={viewMode} />}>
            <SearchCategoryClient
                initialAds={initialAds}
                initialWishlistIds={initialWishlistIds}
                initialTotal={initialTotal}
                categoryId={categoryId}
                user={session?.user || null}
                currentSlug={currentSlug}
                initialViewMode={viewMode}
                categories={categories}
                initialFiltersData={Array.isArray(initialFiltersDataRaw) ? initialFiltersDataRaw : undefined}
                initialUseFiltersData={initialUseFiltersDataRaw && !initialUseFiltersDataRaw.error ? initialUseFiltersDataRaw : undefined}
            />
        </Suspense>
    );
}

