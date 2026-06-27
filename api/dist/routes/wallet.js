"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /wallet
router.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const wallet = await db_1.db.query.wallets.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.wallets.userId, userId) });
        if (!wallet)
            return res.json({ balance: 0, transactions: [] });
        const transactions = await db_1.db.query.transactions.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.transactions.walletId, wallet.id),
            orderBy: [(0, drizzle_orm_1.desc)(schema_1.transactions.createdAt)],
        });
        return res.json({ balance: wallet.balance, transactions });
    }
    catch (err) {
        console.error('Error fetching wallet:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
