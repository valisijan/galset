"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
async function check() {
    const promos = await db_1.db.select().from(schema_1.adPromotions);
    console.log("All promotions in database:", promos);
    process.exit(0);
}
check().catch(console.error);
