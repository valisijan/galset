import 'dotenv/config';
import { db } from '../lib/db';
import { users, wallets, transactions } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const allUsers = await db.select().from(users);
  console.log(`Starting credit assignment for ${allUsers.length} users...`);

  for (const user of allUsers) {
    let [wallet] = await db.select().from(wallets).where(eq(wallets.userId, user.id));
    const oldBalance = wallet ? wallet.balance : 0;
    const addedAmount = 100000;
    let walletId: number;

    if (!wallet) {
      console.log(`User ${user.username || user.email} (ID: ${user.id}) has no wallet. Creating one with ${addedAmount} credits...`);
      const [newWallet] = await db.insert(wallets).values({
        userId: user.id,
        balance: addedAmount,
      }).returning();
      walletId = newWallet.id;
    } else {
      console.log(`User ${user.username || user.email} (ID: ${user.id}) current balance: ${oldBalance}. Adding ${addedAmount}...`);
      const [updatedWallet] = await db.update(wallets)
        .set({
          balance: oldBalance + addedAmount,
          updatedAt: new Date(),
        })
        .where(eq(wallets.userId, user.id))
        .returning();
      walletId = updatedWallet.id;
    }

    // Insert a transaction record
    await db.insert(transactions).values({
      walletId: walletId,
      amount: addedAmount,
      type: 'DEPOSIT',
      description: 'Admin dodela kredita',
    });

    const [finalWallet] = await db.select().from(wallets).where(eq(wallets.userId, user.id));
    console.log(`Successfully updated ${user.username || user.email}. New Balance: ${finalWallet.balance}\n`);
  }

  console.log('Credit assignment completed successfully!');
}

main().catch(console.error);
