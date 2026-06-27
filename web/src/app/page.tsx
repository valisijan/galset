import { db } from "@/db";
import { ads, wishlists, blockedUsers } from "@/db/schema";
import { eq, and, gt, desc, or } from "drizzle-orm";
import { auth } from "@/auth";
import HomeClient from "./HomeClient";
import { unstable_cache } from "next/cache";

export const dynamic = "force-dynamic";

const getCachedLatestAds = unstable_cache(
  async () => {
    const now = new Date();
    return await db.query.ads.findMany({
      where: and(eq(ads.status, "ACTIVE"), gt(ads.expiresAt, now)),
      orderBy: [desc(ads.createdAt)],
      limit: 48,
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
        attributes: true,
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
      }
    });
  },
  ["latest-ads"],
  { revalidate: 120, tags: ["latest-ads"] }
);

export default async function Home() {
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : null;

  // Fetch latest ads (cached for 2 mins)
  const latestAds = await getCachedLatestAds();

  // Filter latest ads in-memory if logged in
  let filteredLatestAds = latestAds;
  if (userId) {
    try {
      const blocks = await db.query.blockedUsers.findMany({
        where: or(
          eq(blockedUsers.blockerId, userId),
          eq(blockedUsers.blockedId, userId)
        )
      });
      const blockedUserIds = new Set(blocks.flatMap(b => [b.blockerId, b.blockedId]));
      blockedUserIds.delete(userId);
      if (blockedUserIds.size > 0) {
        filteredLatestAds = latestAds.filter(ad => !blockedUserIds.has(ad.userId));
      }
    } catch (err) {
      console.error("Error filtering blocked ads on home page:", err);
    }
  }

  // Fetch wishlist IDs if user is logged in
  let wishlistIds: number[] = [];
  if (userId) {
    const wishlistData = await db.query.wishlists.findMany({
      where: eq(wishlists.userId, userId),
      columns: { adId: true }
    });
    wishlistIds = wishlistData.map(w => w.adId);
  }

  return (
    <HomeClient 
      initialAds={filteredLatestAds} 
      initialWishlistIds={wishlistIds} 
      user={session?.user || null}
    />
  );
}
