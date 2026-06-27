import { Router, Request, Response } from 'express';
import { db } from '@/lib/db';
import { wishlists, ads, users } from '@/lib/db/schema';
import { eq, and, or, ilike, inArray, count, desc, asc, sql } from 'drizzle-orm';
import { requireAuth } from '@/middleware/auth';
import { createNotification } from '@/lib/notification-helpers';

const router = Router();

// GET /wishlist
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const search = (req.query.search as string) || '';
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '100');
    const skip = (page - 1) * limit;
    const sort = req.query.sort as string;

    let orderByQuery: any = desc(wishlists.createdAt);
    if (sort === 'price_low') orderByQuery = asc(ads.price);
    else if (sort === 'price_high') orderByQuery = desc(ads.price);
    else if (sort === 'old') orderByQuery = asc(wishlists.createdAt);

    let adCondition: any = undefined;
    if (search) {
      const matchingAds = await db.query.ads.findMany({ where: or(ilike(ads.title, `%${search}%`), ilike(ads.description, `%${search}%`)), columns: { id: true } });
      const matchIds = matchingAds.map((a: any) => a.id);
      adCondition = matchIds.length > 0 ? inArray(wishlists.adId, matchIds) : sql`false`;
    }

    const whereClause: any = search ? and(eq(wishlists.userId, userId), adCondition) : eq(wishlists.userId, userId);
    const [wishlistItems, totalResult] = await Promise.all([
      db.query.wishlists.findMany({ where: whereClause, offset: skip, limit, with: { ad: { with: { user: { columns: { id: true, fullName: true, username: true, profileImg: true } }, promotions: { where: (adPromotions, { gt }) => gt(adPromotions.expiresAt, new Date()) } } } }, orderBy: [orderByQuery] }),
      db.select({ count: count() }).from(wishlists).where(whereClause),
    ]);

    return res.json({ success: true, ads: wishlistItems.map((item: any) => item.ad), total: Number(totalResult[0].count) });
  } catch (err: any) {
    console.error("Error fetching wishlist:", err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST /wishlist — toggle
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { adId } = req.body;
    if (!adId) return res.status(400).json({ error: 'Ad ID missing' });

    const existing = await db.query.wishlists.findFirst({ where: and(eq(wishlists.userId, userId), eq(wishlists.adId, adId)) });
    if (existing) {
      await db.delete(wishlists).where(eq(wishlists.id, existing.id));
      return res.json({ success: true, action: 'removed' });
    } else {
      await db.insert(wishlists).values({ userId, adId });

      // Pošalji notifikaciju vlasniku oglasa (ne sebi)
      try {
        const [ad, sender] = await Promise.all([
          db.query.ads.findFirst({
            where: eq(ads.id, adId),
            columns: { id: true, title: true, images: true, userId: true },
          }),
          db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: { id: true, username: true, fullName: true },
          }),
        ]);
        if (ad && ad.userId !== userId && sender) {
          const senderName = sender.username || sender.fullName || 'Neko';
          const imageUrl = (ad.images && ad.images.length > 0) ? ad.images[0] : undefined;
          await createNotification({
            userId: ad.userId,
            type: 'AD_WISHLIST',
            title: 'Vaš oglas je praćen',
            body: `Neko je dodao vaš oglas ${ad.title} u listu želja`,
            imageUrl,
            actionUrl: `/ads/oglas-${ad.id}`,
            adId: ad.id,
            senderId: userId,
          });
        }
      } catch (notifErr) {
        console.error('Failed to send wishlist notification:', notifErr);
      }

      return res.json({ success: true, action: 'added' });
    }
  } catch (err: any) {
    console.error("Error toggling wishlist:", err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export default router;
