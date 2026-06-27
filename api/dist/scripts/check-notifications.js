"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
async function check() {
    const notifs = await db_1.db.select().from(schema_1.notifications).orderBy((0, drizzle_orm_1.desc)(schema_1.notifications.createdAt)).limit(10);
    console.log("Recent notifications in database:", notifs);
    process.exit(0);
}
check().catch(console.error);
