"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const notification_helpers_1 = require("../lib/notification-helpers");
const router = (0, express_1.Router)();
// GET /wishlist
router.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const search = req.query.search || '';
        const page = parseInt(req.query.page || '1');
        const limit = parseInt(req.query.limit || '100');
        const skip = (page - 1) * limit;
        const sort = req.query.sort;
        let orderByQuery = (0, drizzle_orm_1.desc)(schema_1.wishlists.createdAt);
        if (sort === 'price_low')
            orderByQuery = (0, drizzle_orm_1.asc)(schema_1.ads.price);
        else if (sort === 'price_high')
            orderByQuery = (0, drizzle_orm_1.desc)(schema_1.ads.price);
        else if (sort === 'old')
            orderByQuery = (0, drizzle_orm_1.asc)(schema_1.wishlists.createdAt);
        let adCondition = undefined;
        if (search) {
            const matchingAds = await db_1.db.query.ads.findMany({ where: (0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.ads.title, `%${search}%`), (0, drizzle_orm_1.ilike)(schema_1.ads.description, `%${search}%`)), columns: { id: true } });
            const matchIds = matchingAds.map((a) => a.id);
            adCondition = matchIds.length > 0 ? (0, drizzle_orm_1.inArray)(schema_1.wishlists.adId, matchIds) : (0, drizzle_orm_1.sql) `false`;
        }
        const whereClause = search ? (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.wishlists.userId, userId), adCondition) : (0, drizzle_orm_1.eq)(schema_1.wishlists.userId, userId);
        const [wishlistItems, totalResult] = await Promise.all([
            db_1.db.query.wishlists.findMany({ where: whereClause, offset: skip, limit, with: { ad: { with: { user: { columns: { id: true, fullName: true, username: true, profileImg: true } }, promotions: { where: (adPromotions, { gt }) => gt(adPromotions.expiresAt, new Date()) } } } }, orderBy: [orderByQuery] }),
            db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.wishlists).where(whereClause),
        ]);
        return res.json({ success: true, ads: wishlistItems.map((item) => item.ad), total: Number(totalResult[0].count) });
    }
    catch (err) {
        console.error("Error fetching wishlist:", err);
        return res.status(500).json({ error: err.message || 'Internal server error' });
    }
});
// POST /wishlist — toggle
router.post('/', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { adId } = req.body;
        if (!adId)
            return res.status(400).json({ error: 'Ad ID missing' });
        const existing = await db_1.db.query.wishlists.findFirst({ where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.wishlists.userId, userId), (0, drizzle_orm_1.eq)(schema_1.wishlists.adId, adId)) });
        if (existing) {
            await db_1.db.delete(schema_1.wishlists).where((0, drizzle_orm_1.eq)(schema_1.wishlists.id, existing.id));
            return res.json({ success: true, action: 'removed' });
        }
        else {
            await db_1.db.insert(schema_1.wishlists).values({ userId, adId });
            // Pošalji notifikaciju vlasniku oglasa (ne sebi)
            try {
                const [ad, sender] = await Promise.all([
                    db_1.db.query.ads.findFirst({
                        where: (0, drizzle_orm_1.eq)(schema_1.ads.id, adId),
                        columns: { id: true, title: true, images: true, userId: true },
                    }),
                    db_1.db.query.users.findFirst({
                        where: (0, drizzle_orm_1.eq)(schema_1.users.id, userId),
                        columns: { id: true, username: true, fullName: true },
                    }),
                ]);
                if (ad && ad.userId !== userId && sender) {
                    const senderName = sender.username || sender.fullName || 'Neko';
                    const imageUrl = (ad.images && ad.images.length > 0) ? ad.images[0] : undefined;
                    await (0, notification_helpers_1.createNotification)({
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
            }
            catch (notifErr) {
                console.error('Failed to send wishlist notification:', notifErr);
            }
            return res.json({ success: true, action: 'added' });
        }
    }
    catch (err) {
        console.error("Error toggling wishlist:", err);
        return res.status(500).json({ error: err.message || 'Internal server error' });
    }
});
exports.default = router;
