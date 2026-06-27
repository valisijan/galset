"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv = __importStar(require("dotenv"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
dotenv.config();
async function main() {
    const client = new pg_1.Client({
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
            await client.query('INSERT INTO "Pricing" (id, category, name, price, currency, features, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [
                row.id,
                row.category,
                row.name,
                row.price,
                row.currency,
                JSON.stringify(row.features),
                row.createdAt || new Date().toISOString(),
                row.updatedAt || new Date().toISOString()
            ]);
        }
        console.log(`Inserted ${pricingData.length} rows into "Pricing".`);
        const maxIdRes = await client.query('SELECT max(id) FROM "Pricing"');
        const maxId = maxIdRes.rows[0].max;
        if (maxId) {
            await client.query(`SELECT setval(pg_get_serial_sequence('"Pricing"', 'id'), $1)`, [maxId]);
            console.log(`Sequence synced for table "Pricing" to max ID ${maxId}`);
        }
        else {
            await client.query(`SELECT setval(pg_get_serial_sequence('"Pricing"', 'id'), 1)`);
        }
        await client.query("COMMIT");
        console.log("Database update committed successfully.");
    }
    catch (err) {
        await client.query("ROLLBACK");
        console.error("Database update failed, rolled back.", err);
        throw err;
    }
    finally {
        await client.end();
    }
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
