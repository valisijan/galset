"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /notifications/unread-count
router.get('/unread-count', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const [result] = await db_1.db
            .select({ count: (0, drizzle_orm_1.count)() })
            .from(schema_1.notifications)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.notifications.userId, userId), (0, drizzle_orm_1.eq)(schema_1.notifications.isRead, false), (0, drizzle_orm_1.ne)(schema_1.notifications.type, 'MESSAGE_REACTION')));
        return res.json({ success: true, count: Number(result.count) });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
// GET /notifications
router.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page || '1');
        const limit = parseInt(req.query.limit || '20');
        const skip = (page - 1) * limit;
        const whereClause = (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.notifications.userId, userId), (0, drizzle_orm_1.ne)(schema_1.notifications.type, 'MESSAGE_REACTION'));
        const [notificationsResult, totalResult, unreadResult] = await Promise.all([
            db_1.db.query.notifications.findMany({ where: whereClause, orderBy: [(0, drizzle_orm_1.desc)(schema_1.notifications.createdAt)], offset: skip, limit }),
            db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.notifications).where(whereClause),
            db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.notifications).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.notifications.userId, userId), (0, drizzle_orm_1.eq)(schema_1.notifications.isRead, false), (0, drizzle_orm_1.ne)(schema_1.notifications.type, 'MESSAGE_REACTION'))),
        ]);
        return res.json({
            success: true,
            notifications: notificationsResult,
            total: Number(totalResult[0].count),
            unreadCount: Number(unreadResult[0].count),
        });
    }
    catch (error) {
        console.error('Notifications GET API Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
// POST /notifications — mark all as read (sets isRead=true AND readAt=now)
router.post('/', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        await db_1.db.update(schema_1.notifications)
            .set({ isRead: true, readAt: new Date() })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.notifications.userId, userId), (0, drizzle_orm_1.eq)(schema_1.notifications.isRead, false), (0, drizzle_orm_1.ne)(schema_1.notifications.type, 'MESSAGE_REACTION')));
        return res.json({ success: true });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
exports.default = router;
