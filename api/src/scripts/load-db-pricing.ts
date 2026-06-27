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

    const inputPath = path.join(__dirname, "../../db_pricing_dump.json");
    const pricingData = JSON.parse(fs.readFileSync(inputPath, "utf8"));
    console.log(`Read ${pricingData.length} pricing rows from dump file.`);

    // Start transaction
    await client.query("BEGIN");
    try {
        await client.query('DELETE FROM "Pricing"');
        console.log('Cleared all current rows in "Pricing" table.');

        for (const row of pricingData) {
            await client.query(
                'INSERT INTO "Pricing" (id, category, name, price, currency, features, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                [
                    row.id,
                    row.category,
                    row.name,
                    row.price,
                    row.currency,
                    JSON.stringify(row.features),
                    row.createdAt || new Date().toISOString(),
                    row.updatedAt || new Date().toISOString()
                ]
            );
        }
        console.log(`Inserted ${pricingData.length} rows into "Pricing".`);

        const maxIdRes = await client.query('SELECT max(id) FROM "Pricing"');
        const maxId = maxIdRes.rows[0].max;
        if (maxId) {
            await client.query(`SELECT setval(pg_get_serial_sequence('"Pricing"', 'id'), $1)`, [maxId]);
            console.log(`Sequence synced for table "Pricing" to max ID ${maxId}`);
        } else {
            await client.query(`SELECT setval(pg_get_serial_sequence('"Pricing"', 'id'), 1)`);
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
