"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const userId = req.query.userId;
        const page = parseInt(req.query.page || '1');
        const limit = parseInt(req.query.limit || '10');
        const sortBy = req.query.sortBy || 'newest';
        const skip = (page - 1) * limit;
        if (!userId)
            return res.status(400).json({ success: false, message: 'Missing userId' });
        let orderByExpression = (0, drizzle_orm_1.desc)(schema_1.reviews.createdAt);
        if (sortBy === 'highest') {
            orderByExpression = (0, drizzle_orm_1.desc)(schema_1.reviews.rating);
        }
        else if (sortBy === 'lowest') {
            orderByExpression = (0, drizzle_orm_1.asc)(schema_1.reviews.rating);
        }
        const [reviewsArray, totalResult] = await Promise.all([
            db_1.db.query.reviews.findMany({
                where: (0, drizzle_orm_1.eq)(schema_1.reviews.userId, parseInt(userId)),
                with: { reviewer: { columns: { id: true, fullName: true, username: true, profileImg: true, email: true } } },
                orderBy: [orderByExpression], offset: skip, limit,
            }),
            db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.reviews).where((0, drizzle_orm_1.eq)(schema_1.reviews.userId, parseInt(userId))),
        ]);
        return res.json({ success: true, reviews: reviewsArray, total: Number(totalResult[0].count) });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
router.get('/stats', async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId)
            return res.status(400).json({ success: false, message: 'Missing userId' });
        const uid = parseInt(userId);
        if (isNaN(uid))
            return res.status(400).json({ success: false, message: 'Invalid userId' });
        const [stats] = await db_1.db.select({
            count: (0, drizzle_orm_1.count)(),
            avg: (0, drizzle_orm_1.avg)(schema_1.reviews.rating),
        })
            .from(schema_1.reviews)
            .where((0, drizzle_orm_1.eq)(schema_1.reviews.userId, uid));
        return res.json({
            success: true,
            stats: {
                avg: stats.avg ? parseFloat(stats.avg) : 0,
                count: stats.count || 0
            }
        });
    }
    catch (error) {
        console.error('Fetch review stats error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
exports.default = router;
