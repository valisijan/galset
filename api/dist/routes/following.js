"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /following — ko prati mene (moji followers)
router.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page || '1');
        const limit = parseInt(req.query.limit || '20');
        const skip = (page - 1) * limit;
        const [followers, totalResult] = await Promise.all([
            db_1.db.query.userFollows.findMany({
                where: (0, drizzle_orm_1.eq)(schema_1.userFollows.followingId, userId),
                with: { follower: { columns: { id: true, fullName: true, username: true, profileImg: true } } },
                orderBy: [(0, drizzle_orm_1.desc)(schema_1.userFollows.createdAt)],
                offset: skip,
                limit,
            }),
            db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.userFollows).where((0, drizzle_orm_1.eq)(schema_1.userFollows.followingId, userId)),
        ]);
        return res.json({ success: true, users: followers.map((f) => f.follower), total: Number(totalResult[0].count) });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
exports.default = router;
