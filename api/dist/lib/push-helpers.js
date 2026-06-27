"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPushToUser = sendPushToUser;
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const firebase_admin_1 = require("./firebase-admin");
async function sendPushToUser({ userId, title, body, data, type, }) {
    try {
        console.log(`[PUSH] sendPushToUser triggered for userId: ${userId}, title: "${title}"`);
        if (type) {
            const prefs = await db_1.db.query.notificationPreferences.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.notificationPreferences.userId, userId)
            });
            const isEnabled = prefs ? prefs[type] : true;
            if (!isEnabled) {
                console.log(`[PUSH] Push notification skipped for userId: ${userId} because preference "${type}" is disabled.`);
                return;
            }
        }
        const tokens = await db_1.db.select().from(schema_1.pushTokens).where((0, drizzle_orm_1.eq)(schema_1.pushTokens.userId, userId));
        console.log(`[PUSH] Found ${tokens.length} tokens for userId: ${userId}`);
        if (!tokens.length)
            return;
        const invalidTokens = [];
        await Promise.all(tokens.map(async (doc) => {
            const ok = await (0, firebase_admin_1.sendPushNotification)({ token: doc.token, title, body, data });
            if (!ok) {
                invalidTokens.push(doc.token);
            }
        }));
        if (invalidTokens.length) {
            await db_1.db.delete(schema_1.pushTokens).where((0, drizzle_orm_1.inArray)(schema_1.pushTokens.token, invalidTokens));
            console.log(`[PUSH] Cleaned up ${invalidTokens.length} invalid tokens`);
        }
    }
    catch (err) {
        console.error('❌ Greška pri slanju push notifikacije korisniku:', err);
    }
}
