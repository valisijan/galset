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

    // Load Filters Data
    const filtersPath = path.join(__dirname, "../../db_filters_dump.json");
    let filtersRaw = fs.readFileSync(filtersPath, "utf8");
    if (filtersRaw.charCodeAt(0) === 0xFEFF) {
        filtersRaw = filtersRaw.slice(1);
    }
    const filtersData = JSON.parse(filtersRaw);
    console.log(`Read ${filtersData.length} filters from dump file.`);

    // Load Filter Uses Data
    const filterUsesPath = path.join(__dirname, "../../db_filteruses_dump.json");
    let filterUsesRaw = fs.readFileSync(filterUsesPath, "utf8");
    if (filterUsesRaw.charCodeAt(0) === 0xFEFF) {
        filterUsesRaw = filterUsesRaw.slice(1);
    }
    const filterUsesData = JSON.parse(filterUsesRaw);
    console.log(`Read ${filterUsesData.length} filter uses from dump file.`);

    // Start transaction
    await client.query("BEGIN");
    try {
        // 1. Delete filters not present in the dump (will cascade delete filter uses if fk matches)
        // To be safe, clear filter uses first
        await client.query('DELETE FROM "FilterUse"');
        console.log('Cleared all current rows in "FilterUse" table.');

        const existingFilterIds = filtersData.map((row: any) => row.id);
        if (existingFilterIds.length > 0) {
            const deleteResult = await client.query(
                `DELETE FROM "Filter" WHERE id NOT IN (${existingFilterIds.join(",")})`
            );
            console.log(`Deleted ${deleteResult.rowCount} filters not present in the dump file.`);
        }

        // 2. Upsert Filters
        console.log("Upserting filters...");
        for (const row of filtersData) {
            await client.query(
                `INSERT INTO "Filter" (id, name, slug, type, options, source, "isFormRadio") 
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT (id) DO UPDATE 
                 SET name = EXCLUDED.name, 
                     slug = EXCLUDED.slug, 
                     type = EXCLUDED.type, 
                     options = EXCLUDED.options, 
                     source = EXCLUDED.source, 
                     "isFormRadio" = EXCLUDED."isFormRadio"`,
                [
                    row.id,
                    row.name,
                    row.slug,
                    row.type,
                    row.options ? JSON.stringify(row.options) : null,
                    row.source,
                    row.isFormRadio ?? false
                ]
            );
        }
        console.log(`Upserted ${filtersData.length} filters into "Filter" table.`);

        // 3. Sync Sequence for Filter ID
        const maxIdRes = await client.query('SELECT max(id) FROM "Filter"');
        const maxId = maxIdRes.rows[0].max;
        if (maxId) {
            await client.query(`SELECT setval(pg_get_serial_sequence('"Filter"', 'id'), $1)`, [maxId]);
            console.log(`Sequence synced for table "Filter" to max ID ${maxId}`);
        } else {
            await client.query(`SELECT setval(pg_get_serial_sequence('"Filter"', 'id'), 1)`);
        }

        // 4. Insert Filter Uses in batches
        console.log("Inserting filter uses...");
        const batchSize = 200;
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
