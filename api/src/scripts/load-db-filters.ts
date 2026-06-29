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

    const inputPath = path.join(__dirname, "../../db_filters_dump.json");
    const filtersData = JSON.parse(fs.readFileSync(inputPath, "utf8"));
    console.log(`Read ${filtersData.length} filters from dump file.`);

    // Start transaction
    await client.query("BEGIN");
    try {
        // Delete filters not in the dump
        const existingIds = filtersData.map((row: any) => row.id);
        if (existingIds.length > 0) {
            const deleteResult = await client.query(
                `DELETE FROM "Filter" WHERE id NOT IN (${existingIds.join(",")})`
            );
            console.log(`Deleted ${deleteResult.rowCount} filters not present in the dump file.`);
        }

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

        const maxIdRes = await client.query('SELECT max(id) FROM "Filter"');
        const maxId = maxIdRes.rows[0].max;
        if (maxId) {
            await client.query(`SELECT setval(pg_get_serial_sequence('"Filter"', 'id'), $1)`, [maxId]);
            console.log(`Sequence synced for table "Filter" to max ID ${maxId}`);
        } else {
            await client.query(`SELECT setval(pg_get_serial_sequence('"Filter"', 'id'), 1)`);
        }

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
