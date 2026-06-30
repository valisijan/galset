import { Client } from "pg";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    console.log("Connected to database.");

    const categoriesPath = path.join(__dirname, "../../db_categories_dump.json");
    const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, "utf8"));
    console.log(`Read ${categoriesData.length} categories from dump file.`);

    const filterUsesPath = path.join(__dirname, "../../db_filteruses_dump.json");
    const filterUsesData = JSON.parse(fs.readFileSync(filterUsesPath, "utf8"));
    console.log(`Read ${filterUsesData.length} filter uses from dump file.`);

    // Start transaction
    await client.query("BEGIN");
    try {
        // 1. Delete categories not in the dump
        const existingCatIds = categoriesData.map((row: any) => row.id);
        if (existingCatIds.length > 0) {
            // First delete filter uses that reference deleted categories
            await client.query(
                `DELETE FROM "FilterUse" WHERE "categoryId" NOT IN (${existingCatIds.join(",")})`
            );
            const deleteResult = await client.query(
                `DELETE FROM "Category" WHERE id NOT IN (${existingCatIds.join(",")})`
            );
            console.log(`Deleted ${deleteResult.rowCount} categories not present in the dump file.`);
        }

        // 2. Upsert categories in batches
        const batchSize = 200;
        for (let i = 0; i < categoriesData.length; i += batchSize) {
            const batch = categoriesData.slice(i, i + batchSize);
            const valueRows: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            for (const row of batch) {
                valueRows.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4})`);
                values.push(row.id, row.name, row.slug, row.icon, row.parentId);
                paramIndex += 5;
            }

            const query = `
                INSERT INTO "Category" (id, name, slug, icon, "parentId") 
                VALUES ${valueRows.join(", ")}
                ON CONFLICT (id) DO UPDATE 
                SET name = EXCLUDED.name, 
                    slug = EXCLUDED.slug, 
                    icon = EXCLUDED.icon, 
                    "parentId" = EXCLUDED."parentId"`;
            
            await client.query(query, values);
        }
        console.log(`Upserted ${categoriesData.length} categories into "Category" table.`);

        // Sync sequence
        const maxCatIdRes = await client.query('SELECT max(id) FROM "Category"');
        const maxCatId = maxCatIdRes.rows[0].max;
        if (maxCatId) {
            await client.query(`SELECT setval(pg_get_serial_sequence('"Category"', 'id'), $1)`, [maxCatId]);
            console.log(`Sequence synced for table "Category" to max ID ${maxCatId}`);
        }

        // 3. Clear and reload FilterUse in batches
        await client.query('DELETE FROM "FilterUse"');
        console.log('Cleared all current rows in "FilterUse" table.');

        for (let i = 0; i < filterUsesData.length; i += batchSize) {
            const batch = filterUsesData.slice(i, i + batchSize);
            const valueRows: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            for (const row of batch) {
                valueRows.push(`($${paramIndex}, $${paramIndex + 1})`);
                values.push(row.categoryId, row.filterId);
                paramIndex += 2;
            }

            const query = `
                INSERT INTO "FilterUse" ("categoryId", "filterId") 
                VALUES ${valueRows.join(", ")}
                ON CONFLICT ("categoryId", "filterId") DO NOTHING`;
            
            await client.query(query, values);
        }
        console.log(`Inserted ${filterUsesData.length} rows into "FilterUse".`);

        await client.query("COMMIT");
        console.log("Database update committed successfully.");
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Database update failed, rolled back.", err);
        throw err;
    } finally {
        await client.end();
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
