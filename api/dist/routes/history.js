"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /history
router.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page || '1');
        const limit = parseInt(req.query.limit || '20');
        const skip = (page - 1) * limit;
        const historyItems = await db_1.db.query.adViews.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.adViews.userId, userId),
            orderBy: [(0, drizzle_orm_1.desc)(schema_1.adViews.updatedAt)],
            offset: skip,
            limit,
            with: {
                ad: {
                    with: {
                        user: { columns: { id: true, fullName: true, username: true, profileImg: true } },
                        promotions: {
                            where: (adPromotions, { gt }) => gt(adPromotions.expiresAt, new Date())
                        }
                    },
                },
            },
        });
        const adsList = historyItems.map((h) => h.ad).filter(Boolean);
        return res.json({ success: true, history: adsList, ads: adsList });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
// POST /history/sync — sinhronizuj više pregleda oglasa
router.post('/sync', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { adIds } = req.body;
        if (!adIds || !Array.isArray(adIds) || adIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid adIds' });
        }
        const valuesToInsert = adIds.map((id) => ({
            userId,
            adId: parseInt(id)
        }));
        await db_1.db.insert(schema_1.adViews)
            .values(valuesToInsert)
            .onConflictDoUpdate({
            target: [schema_1.adViews.userId, schema_1.adViews.adId],
            set: { updatedAt: new Date() }
        });
        return res.json({ success: true });
    }
    catch (error) {
        console.error("Failed to sync history:", error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
// POST /history — zabelezi pregled oglasa
router.post('/', auth_1.optionalAuth, async (req, res) => {
    try {
        const { adId } = req.body;
        if (!adId)
            return res.status(400).json({ success: false });
        // Determine the userId from req.user (optional token) or fallback to req.body.userId
        let userIdVal = null;
        if (req.user?.id) {
            userIdVal = req.user.id;
        }
        else if (req.body.userId) {
            userIdVal = parseInt(req.body.userId);
        }
        await db_1.db.insert(schema_1.adViews)
            .values({
            adId: parseInt(adId),
            userId: userIdVal
        })
            .onConflictDoUpdate({
            target: [schema_1.adViews.userId, schema_1.adViews.adId],
            set: { updatedAt: new Date() }
        });
        return res.json({ success: true });
    }
    catch (error) {
        return res.status(500).json({ success: false });
    }
});
exports.default = router;
