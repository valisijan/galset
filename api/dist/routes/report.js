"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// POST /report
router.post('/', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { targetType, targetId, reason, description } = req.body;
        if (!targetType || !targetId || !reason) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        await db_1.db.insert(schema_1.reports).values({ userId, targetType, targetId: parseInt(targetId), reason, description: description || null });
        return res.json({ success: true });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
exports.default = router;
