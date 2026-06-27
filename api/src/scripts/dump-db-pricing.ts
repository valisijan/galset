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

    const result = await client.query('SELECT * FROM "Pricing" ORDER BY id ASC');
    console.log(`Found ${result.rows.length} pricing rows in DB.`);

    const outputPath = path.join(__dirname, "../../db_pricing_dump.json");
    fs.writeFileSync(outputPath, JSON.stringify(result.rows, null, 2), "utf8");
    console.log(`Saved pricing data to ${outputPath}`);

    await client.end();
    process.exit(0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
