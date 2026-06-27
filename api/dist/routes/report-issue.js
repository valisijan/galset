"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// POST /report-issue
router.post('/', auth_1.optionalAuth, async (req, res) => {
    try {
        const userId = req.user?.id ?? null;
        const { targetType, description } = req.body;
        if (!targetType || !description) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        await db_1.db.insert(schema_1.reportIssues).values({ userId: userId ?? undefined, targetType, description });
        return res.json({ success: true });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
exports.default = router;
