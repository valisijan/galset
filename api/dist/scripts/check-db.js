"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
async function main() {
    const allDrafts = await db_1.db.select().from(schema_1.drafts);
    console.log('ALL DRAFTS IN DB:', JSON.stringify(allDrafts, null, 2));
    process.exit(0);
}
main().catch(console.error);
