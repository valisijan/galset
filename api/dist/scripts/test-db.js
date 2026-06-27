"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
async function run() {
    try {
        const allUsers = await db_1.db.select().from(schema_1.users).limit(10);
        console.log("Users:", allUsers.map(u => ({ id: u.id, username: u.username, email: u.email })));
        const adsCount = await db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.ads);
        console.log("Total Ads in DB:", adsCount[0].count);
        const activeAds = await db_1.db.query.ads.findMany({
            limit: 5,
            with: {
                user: true
            }
        });
        console.log("Sample Ads:", activeAds.map(a => ({ id: a.id, title: a.title, status: a.status, username: a.user?.username })));
    }
    catch (err) {
        console.error("Query error:", err);
    }
    process.exit(0);
}
run();
