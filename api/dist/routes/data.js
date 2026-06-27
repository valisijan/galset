"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const categories_1 = require("./categories");
const router = (0, express_1.Router)();
const globalSlugs = ["q", "sort", "category", "price", "condition", "exchange", "delivery", "seller", "country", "city", "other"];
const fileToType = {
    "aircraft-brands.json": "aircraft",
    "bus-brands.json": "buses",
    "camper-brands.json": "campers",
    "car-brands.json": "cars",
    "machinery-brands.json": "machinery",
    "motorcycle-brands.json": "motorcycles",
    "trailer-brands.json": "trailers",
    "truck-brands.json": "trucks",
    "van-brands.json": "vans",
    "watercraft-brands.json": "watercraft",
};
router.get(['/filters-data.json', '/filters-data'], async (_req, res) => {
    try {
        const allFilters = await db_1.db.select().from(schema_1.filters);
        allFilters.sort((a, b) => {
            const indexA = globalSlugs.indexOf(a.slug);
            const indexB = globalSlugs.indexOf(b.slug);
            if (indexA !== -1 && indexB !== -1)
                return indexA - indexB;
            if (indexA !== -1)
                return -1;
            if (indexB !== -1)
                return 1;
            return a.slug.localeCompare(b.slug);
        });
        return res.json(allFilters);
    }
    catch (error) {
        console.error("[filters-data] Error:", error);
        return res.status(500).json({ error: "Failed to load filters data" });
    }
});
router.get(['/categories.json', '/categories'], async (_req, res) => {
    try {
        const tree = await (0, categories_1.getCategoriesTreeCached)();
        return res.json(tree);
    }
    catch (err) {
        console.error("[categories-data] Error:", err);
        return res.status(500).json({ error: 'Failed to load categories' });
    }
});
router.get(['/filters/use-filters.json', '/filters/use-filters'], async (_req, res) => {
    try {
        const filterRows = await db_1.db.select().from(schema_1.filters);
        const pivotRows = await db_1.db.select().from(schema_1.filterUses);
        const dbGlobalFilters = filterRows.filter(f => globalSlugs.includes(f.slug));
        dbGlobalFilters.sort((a, b) => globalSlugs.indexOf(a.slug) - globalSlugs.indexOf(b.slug));
        const globalIds = dbGlobalFilters.map(f => f.id);
        const specificMap = new Map();
        for (const p of pivotRows) {
            if (!specificMap.has(p.categoryId)) {
                specificMap.set(p.categoryId, []);
            }
            specificMap.get(p.categoryId).push(p.filterId);
        }
        const specific = [];
        for (const [catId, filterIds] of specificMap.entries()) {
            specific.push({
                categoryId: catId.toString(),
                filters: filterIds
            });
        }
        return res.json({
            global: globalIds,
            specific: specific
        });
    }
    catch (error) {
        console.error("[use-filters] Error:", error);
        return res.status(500).json({ error: "Failed to load use-filters mapping" });
    }
});
router.get(['/locations.json', '/locations'], async (_req, res) => {
    try {
        const dbCountries = await db_1.db.select().from(schema_1.countries);
        const dbCities = await db_1.db.select().from(schema_1.cities);
        const locations = {};
        for (const country of dbCountries) {
            const countryCities = dbCities
                .filter(c => c.countryId === country.id)
                .map(c => c.name);
            locations[country.name] = countryCities;
        }
        return res.json(locations);
    }
    catch (error) {
        console.error("[locations] Error:", error);
        return res.status(500).json({ error: "Failed to load locations" });
    }
});
router.get('/brands', async (req, res) => {
    try {
        const type = req.query.type;
        if (!type) {
            return res.status(400).json({ error: "Missing type query parameter" });
        }
        const rows = await db_1.db.select().from(schema_1.brands).where((0, drizzle_orm_1.eq)(schema_1.brands.type, type));
        const formatted = rows.map(r => ({
            brand: r.brand,
            models: r.models
        }));
        return res.json(formatted);
    }
    catch (error) {
        console.error("[brands] Error:", error);
        return res.status(500).json({ error: "Failed to load brands" });
    }
});
router.get('/filters/brands/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const type = fileToType[filename];
        if (!type) {
            return res.status(404).json({ error: "Brand file type not found" });
        }
        const rows = await db_1.db.select().from(schema_1.brands).where((0, drizzle_orm_1.eq)(schema_1.brands.type, type));
        const formatted = rows.map(r => ({
            brand: r.brand,
            models: r.models
        }));
        return res.json(formatted);
    }
    catch (error) {
        console.error("[brands-compat] Error:", error);
        return res.status(500).json({ error: "Failed to load brands compatibility route" });
    }
});
router.get('/*', async (req, res) => {
    try {
        const cleanPath = req.params[0].replace(/\.\./g, "");
        if (cleanPath === 'locations.json' || cleanPath === 'locations') {
            return res.redirect('/api/data/locations');
        }
        if (cleanPath === 'filters/use-filters.json' || cleanPath === 'filters/use-filters') {
            return res.redirect('/api/data/filters/use-filters');
        }
        return res.status(404).json({ error: 'Data resource not found' });
    }
    catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
