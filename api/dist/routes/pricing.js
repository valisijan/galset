"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const data = await db_1.db.select().from(schema_1.pricing);
        return res.json({ success: true, pricing: data });
    }
    catch (err) {
        console.error('Error fetching pricing:', err);
        return res.status(500).json({ error: 'Internal server error', message: err.message });
    }
});
exports.default = router;
