import { Router, Request, Response } from 'express';
import { db } from '@/lib/db';
import { users, sales } from '@/lib/db/schema';
import { eq, count } from 'drizzle-orm';

const router = Router();

// GET /user/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid user ID' });

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: { id: true, fullName: true, username: true, profileImg: true, description: true, country: true, city: true, createdAt: true },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const [successfulSalesResult] = await db.select({
      count: count()
    }).from(sales).where(eq(sales.sellerId, user.id));

    const successfulSales = successfulSalesResult?.count ? Number(successfulSalesResult.count) : 0;

    return res.json({
      success: true,
      user: {
        ...user,
        successfulSales
      }
    });
  } catch (err: any) {
    console.error('Error in GET /user/:id:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
