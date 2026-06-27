"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCategoriesCache = clearCategoriesCache;
exports.getCategoriesTreeCached = getCategoriesTreeCached;
const express_1 = require("express");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
let cachedCategoriesTree = null;
let cacheExpiry = 0;
const CACHE_TTL = 3600 * 1000; // 1 hour
async function getCategoriesTree() {
    const allRows = await db_1.db.select().from(schema_1.categories).orderBy((0, drizzle_orm_1.asc)(schema_1.categories.id));
    // Build a map of parentId to children list
    const byParent = new Map();
    for (const row of allRows) {
        const parent = row.parentId;
        if (!byParent.has(parent)) {
            byParent.set(parent, []);
        }
        byParent.get(parent).push({
            id: row.id,
            name: row.name,
            slug: row.slug,
            icon: row.icon,
            subcategories: []
        });
    }
    // Recursive helper to build tree
    function buildTree(parentId) {
        const list = byParent.get(parentId) || [];
        for (const item of list) {
            const children = buildTree(item.id);
            if (children.length > 0) {
                item.subcategories = children;
            }
            else {
                delete item.subcategories; // remove empty subcategories array if any
            }
        }
        return list;
    }
    return buildTree(null);
}
function clearCategoriesCache() {
    cachedCategoriesTree = null;
    cacheExpiry = 0;
}
async function getCategoriesTreeCached() {
    const now = Date.now();
    if (!cachedCategoriesTree || now > cacheExpiry) {
        cachedCategoriesTree = await getCategoriesTree();
        cacheExpiry = now + CACHE_TTL;
    }
    return cachedCategoriesTree;
}
// GET /categories
router.get('/', async (_req, res) => {
    try {
        const tree = await getCategoriesTreeCached();
        return res.json({ success: true, categories: tree });
    }
    catch (err) {
        console.error('Failed to load categories:', err);
        return res.status(500).json({ error: 'Failed to load categories' });
    }
});
// POST /categories/clear-cache - invalidate in-memory cache
router.post('/clear-cache', async (_req, res) => {
    clearCategoriesCache();
    return res.json({ success: true, message: 'Categories cache cleared' });
});
exports.default = router;
