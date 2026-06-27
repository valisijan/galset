"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
async function test() {
    console.log("Checking for ads...");
    const allAds = await db_1.db.select().from(schema_1.ads).limit(5);
    if (allAds.length === 0) {
        console.log("No ads found in the database. Please create an ad first.");
        process.exit(0);
    }
    const testAd = allAds[0];
    console.log(`Found ad: "${testAd.title}" (ID: ${testAd.id}) owned by user ID: ${testAd.userId}`);
    // Clean up any existing promotions for this ad to prevent issues
    await db_1.db.delete(schema_1.adPromotions).where((0, drizzle_orm_1.eq)(schema_1.adPromotions.adId, testAd.id));
    // Insert a promotion that expired 5 minutes ago
    const expiresAt = new Date(Date.now() - 5 * 60 * 1000);
    const [newPromo] = await db_1.db.insert(schema_1.adPromotions).values({
        adId: testAd.id,
        type: 'FEATURED',
        expiresAt,
    }).returning();
    console.log(`Inserted expired promotion: ID ${newPromo.id}, type ${newPromo.type}, expired at ${newPromo.expiresAt.toISOString()}`);
    console.log("Done. Now trigger the cron/cleanup API to check if notification is sent.");
    process.exit(0);
}
test().catch(console.error);
