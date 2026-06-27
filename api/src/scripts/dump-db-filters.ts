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

    const result = await client.query('SELECT * FROM "Filter" ORDER BY id ASC');
    console.log(`Found ${result.rows.length} filters in DB.`);

    const outputPath = path.join(__dirname, "../../db_filters_dump.json");
    fs.writeFileSync(outputPath, JSON.stringify(result.rows, null, 2), "utf8");
    console.log(`Saved filters to ${outputPath}`);

    await client.end();
    process.exit(0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
