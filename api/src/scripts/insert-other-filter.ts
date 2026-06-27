import { Client } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    console.log("Connected to database.");

    // Check if other filter exists
    const check = await client.query('SELECT * FROM "Filter" WHERE slug = \'other\'');
    if (check.rows.length === 0) {
        // Insert new filter
        const query = `
            INSERT INTO "Filter" (id, name, slug, type, options, source, "isFormRadio")
            VALUES (218, 'Ostalo', 'other', 'checkbox-multi', $1, null, false)
        `;
        const options = [
            { name: "Samo sa cenom", slug: "only-price" },
            { name: "Samo sa slikom", slug: "only-image" },
            { name: "Oglasi u poslednjih 48h", slug: "last-48h" }
        ];
        await client.query(query, [JSON.stringify(options)]);
        console.log("Successfully inserted new 'other' filter.");
    } else {
        console.log("Filter 'other' already exists.");
    }

    await client.end();
    process.exit(0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
