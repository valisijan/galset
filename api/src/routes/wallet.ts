import { Router, Request, Response } from 'express';
import { db } from '@/lib/db';
import { wallets, transactions as walletTransactions } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '@/middleware/auth';

const router = Router();

// GET /wallet
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const wallet = await db.query.wallets.findFirst({ where: eq(wallets.userId, userId) });
    if (!wallet) return res.json({ balance: 0, transactions: [] });

    const transactions = await db.query.transactions.findMany({
      where: eq(walletTransactions.walletId, wallet.id),
      orderBy: [desc(walletTransactions.createdAt)],
    });

    return res.json({ balance: wallet.balance, transactions });
  } catch (err) {
    console.error('Error fetching wallet:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
