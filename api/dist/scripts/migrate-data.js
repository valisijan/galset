"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const pg_1 = require("pg");
async function migrate() {
    const neonUrl = process.env.NEON_DATABASE_URL;
    const supabaseUrl = process.env.DATABASE_URL;
    if (!neonUrl || !supabaseUrl) {
        console.error("❌ Missing NEON_DATABASE_URL or DATABASE_URL");
        return;
    }
    const neon = new pg_1.Client({ connectionString: neonUrl });
    const supabase = new pg_1.Client({ connectionString: supabaseUrl });
    await neon.connect();
    await supabase.connect();
    console.log("📡 Connected to both databases!");
    // Set session replication role to replica to disable all foreign key constraints during insertion
    await supabase.query("SET session_replication_role = 'replica'");
    try {
        // 1. Countries
        console.log("Migrating Countries...");
        const countriesRes = await neon.query('SELECT * FROM "Country"');
        console.log(`Found ${countriesRes.rows.length} countries in Neon.`);
        for (const row of countriesRes.rows) {
            await supabase.query('INSERT INTO "Country" (id, name, slug) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING', [row.id, row.name, row.slug]);
        }
        console.log("✅ Countries migrated!");
        // 2. Cities
        console.log("Migrating Cities...");
        const citiesRes = await neon.query('SELECT * FROM "City"');
        console.log(`Found ${citiesRes.rows.length} cities in Neon.`);
        for (const row of citiesRes.rows) {
            await supabase.query('INSERT INTO "City" (id, name, slug, "countryId", lat, lng) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING', [row.id, row.name, row.slug, row.countryId, row.lat, row.lng]);
        }
        console.log("✅ Cities migrated!");
        // 3. Categories
        console.log("Migrating Categories...");
        const categoriesRes = await neon.query('SELECT * FROM "Category"');
        console.log(`Found ${categoriesRes.rows.length} categories in Neon.`);
        for (const row of categoriesRes.rows) {
            await supabase.query('INSERT INTO "Category" (id, name, slug, icon, "parentId") VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING', [row.id, row.name, row.slug, row.icon, row.parentId]);
        }
        console.log("✅ Categories migrated!");
        // 4. Filters
        console.log("Migrating Filters...");
        const filtersRes = await neon.query('SELECT * FROM "Filter"');
        console.log(`Found ${filtersRes.rows.length} filters in Neon.`);
        for (const row of filtersRes.rows) {
            await supabase.query('INSERT INTO "Filter" (id, name, slug, type, options, source) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING', [row.id, row.name, row.slug, row.type, JSON.stringify(row.options), row.source]);
        }
        console.log("✅ Filters migrated!");
        // 5. FilterUse (from CategoryFilter)
        console.log("Migrating CategoryFilters (FilterUse)...");
        const catFiltersRes = await neon.query('SELECT * FROM "CategoryFilter"');
        console.log(`Found ${catFiltersRes.rows.length} category filters in Neon.`);
        for (const row of catFiltersRes.rows) {
            await supabase.query('INSERT INTO "FilterUse" ("categoryId", "filterId") VALUES ($1, $2) ON CONFLICT DO NOTHING', [row.categoryId, row.filterId]);
        }
        console.log("✅ FilterUse migrated!");
        // 6. Brand (from BrandModel)
        console.log("Migrating BrandModels (Brand)...");
        const brandModelsRes = await neon.query('SELECT * FROM "BrandModel"');
        console.log(`Found ${brandModelsRes.rows.length} brand models in Neon.`);
        for (const row of brandModelsRes.rows) {
            await supabase.query('INSERT INTO "Brand" (id, type, brand, models) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING', [row.id, row.type, row.brand, JSON.stringify(row.models)]);
        }
        console.log("✅ Brand migrated!");
        // 7. Pricing
        console.log("Migrating Pricing...");
        const pricingRes = await neon.query('SELECT * FROM "Pricing"');
        console.log(`Found ${pricingRes.rows.length} pricing rows in Neon.`);
        for (const row of pricingRes.rows) {
            await supabase.query('INSERT INTO "Pricing" (id, category, name, price, currency, features, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING', [row.id, row.category, row.name, row.price, row.currency, JSON.stringify(row.features), row.createdAt, row.updatedAt]);
        }
        console.log("✅ Pricing migrated!");
        // Reset sequence generators so that new inserts don't conflict with existing IDs
        console.log("🔄 Syncing PostgreSQL serial sequences in Supabase...");
        const tablesWithSerials = ["Country", "City", "Category", "Filter", "Brand", "Pricing"];
        for (const table of tablesWithSerials) {
            const maxIdRes = await supabase.query(`SELECT max(id) FROM "${table}"`);
            const maxId = maxIdRes.rows[0].max;
            if (maxId) {
                await supabase.query(`SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), $1)`, [maxId]);
                console.log(`Sequence synced for table "${table}" to max ID ${maxId}`);
            }
        }
        console.log("✅ PostgreSQL serial sequences successfully synced!");
    }
    catch (err) {
        console.error("❌ Migration error occurred:", err);
    }
    finally {
        // Reset session replication role to default (origin)
        await supabase.query("SET session_replication_role = 'origin'");
    }
    await neon.end();
    await supabase.end();
    console.log("🎉 Data migration finished successfully!");
}
migrate().catch(console.error);
