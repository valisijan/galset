"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /users
router.get('/', auth_1.optionalAuth, async (req, res) => {
    try {
        const search = req.query.search || req.query.q || '';
        const page = parseInt(req.query.page || '1');
        const limit = parseInt(req.query.limit || '20');
        const skip = (page - 1) * limit;
        const whereClause = search
            ? (0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.users.username, `%${search}%`), (0, drizzle_orm_1.ilike)(schema_1.users.fullName, `%${search}%`))
            : undefined;
        const [usersResult, totalResult] = await Promise.all([
            db_1.db.query.users.findMany({
                where: whereClause,
                columns: { id: true, fullName: true, username: true, profileImg: true, country: true, createdAt: true },
                orderBy: [(0, drizzle_orm_1.desc)(schema_1.users.createdAt)],
                offset: skip,
                limit,
            }),
            db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.users).where(whereClause),
        ]);
        // Provera da li ulogovani korisnik prati korisnike iz rezultata
        const currentUserId = req.user?.id;
        let usersWithFollow = usersResult.map(u => ({ ...u, isFollowing: false }));
        if (currentUserId && usersResult.length > 0) {
            const followStatuses = await db_1.db.query.userFollows.findMany({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userFollows.followerId, currentUserId), (0, drizzle_orm_1.inArray)(schema_1.userFollows.followingId, usersResult.map(u => u.id)))
            });
            const followedIds = new Set(followStatuses.map(f => f.followingId));
            usersWithFollow = usersResult.map(u => ({
                ...u,
                isFollowing: followedIds.has(u.id)
            }));
        }
        return res.json({ success: true, users: usersWithFollow, total: Number(totalResult[0].count) });
    }
    catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
// GET /users/:id/is-following
router.get('/:id/is-following', auth_1.requireAuth, async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const targetId = parseInt(req.params.id);
        if (isNaN(targetId))
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        const follow = await db_1.db.query.userFollows.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userFollows.followerId, currentUserId), (0, drizzle_orm_1.eq)(schema_1.userFollows.followingId, targetId)),
        });
        return res.json({ success: true, isFollowing: !!follow });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
exports.default = router;
