"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /block/list — lista blokiranih korisnika
router.get('/list', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const blocked = await db_1.db
            .select({
            id: schema_1.users.id,
            username: schema_1.users.username,
            fullName: schema_1.users.fullName,
            profileImg: schema_1.users.profileImg
        })
            .from(schema_1.blockedUsers)
            .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.blockedUsers.blockedId, schema_1.users.id))
            .where((0, drizzle_orm_1.eq)(schema_1.blockedUsers.blockerId, userId));
        return res.json({ success: true, blockedUsers: blocked });
    }
    catch (error) {
        console.error('Error fetching blocked list:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
// GET /block/status — provera statusa blokiranja
router.get('/status', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const targetUserId = req.query.userId;
        if (!targetUserId) {
            return res.status(400).json({ success: false, message: 'Missing userId' });
        }
        const targetId = parseInt(targetUserId);
        const blocks = await db_1.db.query.blockedUsers.findMany({
            where: (0, drizzle_orm_1.or)((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.blockedUsers.blockerId, userId), (0, drizzle_orm_1.eq)(schema_1.blockedUsers.blockedId, targetId)), (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.blockedUsers.blockerId, targetId), (0, drizzle_orm_1.eq)(schema_1.blockedUsers.blockedId, userId)))
        });
        const isBlockedByMe = blocks.some(b => b.blockerId === userId);
        const amIBlocked = blocks.some(b => b.blockerId === targetId);
        return res.json({
            success: true,
            isBlockedByMe,
            amIBlocked,
            anyBlock: isBlockedByMe || amIBlocked
        });
    }
    catch (error) {
        console.error('Error checking block status:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
// GET /block — lista blokiranih korisnika (fallback)
router.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const blocked = await db_1.db.query.blockedUsers.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.blockedUsers.blockerId, userId),
            with: { blocked: { columns: { id: true, fullName: true, username: true, profileImg: true } } },
        });
        return res.json({ success: true, blocked: blocked.map((b) => b.blocked) });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
// POST /block — toggle block
router.post('/', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { blockedId } = req.body;
        if (!blockedId)
            return res.status(400).json({ success: false, message: 'Missing blockedId' });
        const targetId = parseInt(blockedId);
        const existing = await db_1.db.query.blockedUsers.findFirst({ where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.blockedUsers.blockerId, userId), (0, drizzle_orm_1.eq)(schema_1.blockedUsers.blockedId, targetId)) });
        if (existing) {
            await db_1.db.delete(schema_1.blockedUsers).where((0, drizzle_orm_1.eq)(schema_1.blockedUsers.id, existing.id));
            return res.json({ success: true, isBlocked: false });
        }
        else {
            await db_1.db.insert(schema_1.blockedUsers).values({ blockerId: userId, blockedId: targetId });
            return res.json({ success: true, isBlocked: true });
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
// DELETE /block — deblokiranje korisnika
router.delete('/', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { blockedId } = req.body;
        if (!blockedId)
            return res.status(400).json({ success: false, message: 'Missing blockedId' });
        const targetId = parseInt(blockedId);
        await db_1.db.delete(schema_1.blockedUsers).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.blockedUsers.blockerId, userId), (0, drizzle_orm_1.eq)(schema_1.blockedUsers.blockedId, targetId)));
        return res.json({ success: true });
    }
    catch (error) {
        console.error('Error deleting block:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
exports.default = router;
