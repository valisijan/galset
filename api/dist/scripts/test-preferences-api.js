"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
async function test() {
    const userId = 7; // Our test user
    console.log(`Checking preferences for user ${userId}...`);
    let prefs = await db_1.db.query.notificationPreferences.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_1.notificationPreferences.userId, userId)
    });
    console.log("Current preferences:", prefs);
    // Set expiredPromotions to false
    console.log("Setting expiredPromotions to false...");
    await db_1.db.update(schema_1.notificationPreferences)
        .set({ expiredPromotions: false })
        .where((0, drizzle_orm_1.eq)(schema_1.notificationPreferences.userId, userId));
    prefs = await db_1.db.query.notificationPreferences.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_1.notificationPreferences.userId, userId)
    });
    console.log("Updated preferences (should be false):", prefs);
    // Revert back to true
    console.log("Reverting expiredPromotions back to true...");
    await db_1.db.update(schema_1.notificationPreferences)
        .set({ expiredPromotions: true })
        .where((0, drizzle_orm_1.eq)(schema_1.notificationPreferences.userId, userId));
    prefs = await db_1.db.query.notificationPreferences.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_1.notificationPreferences.userId, userId)
    });
    console.log("Reverted preferences (should be true):", prefs);
    process.exit(0);
}
test().catch(console.error);
