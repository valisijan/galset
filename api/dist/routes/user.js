"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
// GET /user/:id
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ error: 'Invalid user ID' });
        const user = await db_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.id, id),
            columns: { id: true, fullName: true, username: true, profileImg: true, description: true, country: true, city: true, createdAt: true },
        });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const [successfulSalesResult] = await db_1.db.select({
            count: (0, drizzle_orm_1.count)()
        }).from(schema_1.sales).where((0, drizzle_orm_1.eq)(schema_1.sales.sellerId, user.id));
        const successfulSales = successfulSalesResult?.count ? Number(successfulSalesResult.count) : 0;
        return res.json({
            success: true,
            user: {
                ...user,
                successfulSales
            }
        });
    }
    catch (err) {
        console.error('Error in GET /user/:id:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
