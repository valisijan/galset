"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
async function main() {
    const allUsers = await db_1.db.select().from(schema_1.users);
    console.log(`Starting credit assignment for ${allUsers.length} users...`);
    for (const user of allUsers) {
        let [wallet] = await db_1.db.select().from(schema_1.wallets).where((0, drizzle_orm_1.eq)(schema_1.wallets.userId, user.id));
        const oldBalance = wallet ? wallet.balance : 0;
        const addedAmount = 100000;
        let walletId;
        if (!wallet) {
            console.log(`User ${user.username || user.email} (ID: ${user.id}) has no wallet. Creating one with ${addedAmount} credits...`);
            const [newWallet] = await db_1.db.insert(schema_1.wallets).values({
                userId: user.id,
                balance: addedAmount,
            }).returning();
            walletId = newWallet.id;
        }
        else {
            console.log(`User ${user.username || user.email} (ID: ${user.id}) current balance: ${oldBalance}. Adding ${addedAmount}...`);
            const [updatedWallet] = await db_1.db.update(schema_1.wallets)
                .set({
                balance: oldBalance + addedAmount,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.wallets.userId, user.id))
                .returning();
            walletId = updatedWallet.id;
        }
        // Insert a transaction record
        await db_1.db.insert(schema_1.transactions).values({
            walletId: walletId,
            amount: addedAmount,
            type: 'DEPOSIT',
            description: 'Admin dodela kredita',
        });
        const [finalWallet] = await db_1.db.select().from(schema_1.wallets).where((0, drizzle_orm_1.eq)(schema_1.wallets.userId, user.id));
        console.log(`Successfully updated ${user.username || user.email}. New Balance: ${finalWallet.balance}\n`);
    }
    console.log('Credit assignment completed successfully!');
}
main().catch(console.error);
