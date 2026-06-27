"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const notification_helpers_1 = require("../lib/notification-helpers");
const router = (0, express_1.Router)();
router.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const search = req.query.search || '';
        const page = parseInt(req.query.page || '1');
        const limit = parseInt(req.query.limit || '20');
        const skip = (page - 1) * limit;
        let userCondition = undefined;
        if (search) {
            const matchingUsers = await db_1.db.query.users.findMany({ where: (0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.users.username, `%${search}%`), (0, drizzle_orm_1.ilike)(schema_1.users.fullName, `%${search}%`)), columns: { id: true } });
            const matchIds = matchingUsers.map((u) => u.id);
            userCondition = matchIds.length > 0 ? (0, drizzle_orm_1.inArray)(schema_1.userFollows.followingId, matchIds) : (0, drizzle_orm_1.sql) `false`;
        }
        const whereClause = search ? (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userFollows.followerId, userId), userCondition) : (0, drizzle_orm_1.eq)(schema_1.userFollows.followerId, userId);
        const [followingResult, totalResult] = await Promise.all([
            db_1.db.query.userFollows.findMany({
                where: whereClause,
                with: { following: { columns: { id: true, fullName: true, username: true, profileImg: true, createdAt: true }, with: { reviewsReceived: { columns: { rating: true } } } } },
                orderBy: [(0, drizzle_orm_1.desc)(schema_1.userFollows.createdAt)], offset: skip, limit,
            }),
            db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.userFollows).where(whereClause),
        ]);
        const mappedUsers = followingResult.map((f) => {
            const reviews = f.following?.reviewsReceived || [];
            const ratingCount = reviews.length;
            const rating = ratingCount > 0 ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / ratingCount : 0;
            return { id: f.following.id, fullName: f.following.fullName, username: f.following.username, profileImg: f.following.profileImg, createdAt: f.following.createdAt?.toISOString(), rating: parseFloat(rating.toFixed(1)), ratingCount };
        });
        return res.json({ success: true, users: mappedUsers, total: Number(totalResult[0].count) });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
router.post('/', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { followingId } = req.body;
        if (!followingId)
            return res.status(400).json({ success: false, message: 'Missing followingId' });
        const targetId = parseInt(followingId);
        const existingFollow = await db_1.db.query.userFollows.findFirst({ where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userFollows.followerId, userId), (0, drizzle_orm_1.eq)(schema_1.userFollows.followingId, targetId)) });
        if (existingFollow) {
            await db_1.db.delete(schema_1.userFollows).where((0, drizzle_orm_1.eq)(schema_1.userFollows.id, existingFollow.id));
            return res.json({ success: true, isFollowing: false });
        }
        else {
            await db_1.db.insert(schema_1.userFollows).values({ followerId: userId, followingId: targetId });
            // Pošalji notifikaciju zapraćenom korisniku
            try {
                const follower = await db_1.db.query.users.findFirst({
                    where: (0, drizzle_orm_1.eq)(schema_1.users.id, userId),
                    columns: { id: true, username: true, fullName: true, profileImg: true },
                });
                if (follower) {
                    const displayName = follower.username || follower.fullName || 'Neko';
                    await (0, notification_helpers_1.createNotification)({
                        userId: targetId,
                        type: 'USER_FOLLOW',
                        title: 'Novi pratilac',
                        body: `Korisnik ${displayName} vas je zapratio.`,
                        imageUrl: follower.profileImg || undefined,
                        actionUrl: `/${follower.username || follower.id}`,
                        senderId: userId,
                    });
                }
            }
            catch (notifErr) {
                console.error('Failed to send follow notification:', notifErr);
            }
            return res.json({ success: true, isFollowing: true });
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
exports.default = router;
