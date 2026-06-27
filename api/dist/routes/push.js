"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const push_helpers_1 = require("../lib/push-helpers");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// POST /push/send
router.post('/send', async (req, res) => {
    try {
        const { userId, title, body, data } = req.body;
        if (!userId || !title || !body) {
            return res.status(400).json({ success: false, error: 'Missing fields' });
        }
        await (0, push_helpers_1.sendPushToUser)({ userId: Number(userId), title, body, data });
        return res.json({ success: true });
    }
    catch (err) {
        console.error('❌ Push API greška:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});
// POST /push/save-token
router.post('/save-token', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { token } = req.body;
        if (!token || typeof token !== 'string') {
            return res.status(400).json({ success: false, error: 'Invalid token' });
        }
        await db_1.db.insert(schema_1.pushTokens).values({
            userId,
            token,
            updatedAt: new Date(),
            createdAt: new Date(),
        }).onConflictDoUpdate({
            target: schema_1.pushTokens.token,
            set: {
                userId,
                updatedAt: new Date(),
            }
        });
        console.log(`✅ FCM token sačuvan za korisnika ${userId}`);
        return res.json({ success: true });
    }
    catch (err) {
        console.error('❌ Greška pri čuvanju FCM tokena:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});
// POST /push/delete-token
router.post('/delete-token', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { token } = req.body;
        if (!token || typeof token !== 'string') {
            return res.status(400).json({ success: false, error: 'Invalid token' });
        }
        await db_1.db.delete(schema_1.pushTokens).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.pushTokens.token, token), (0, drizzle_orm_1.eq)(schema_1.pushTokens.userId, userId)));
        console.log(`❌ FCM token obrisan za korisnika ${userId}`);
        return res.json({ success: true });
    }
    catch (err) {
        console.error('❌ Greška pri brisanju FCM tokena:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});
exports.default = router;
