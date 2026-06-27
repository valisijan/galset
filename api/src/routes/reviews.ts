import { Router, Request, Response } from 'express';
import { db } from '@/lib/db';
import { reviews } from '@/lib/db/schema';
import { eq, count, desc, asc, avg } from 'drizzle-orm';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '10');
    const sortBy = (req.query.sortBy as string) || 'newest';
    const skip = (page - 1) * limit;

    if (!userId) return res.status(400).json({ success: false, message: 'Missing userId' });

    let orderByExpression: any = desc(reviews.createdAt);
    if (sortBy === 'highest') {
      orderByExpression = desc(reviews.rating);
    } else if (sortBy === 'lowest') {
      orderByExpression = asc(reviews.rating);
    }

    const [reviewsArray, totalResult] = await Promise.all([
      db.query.reviews.findMany({
        where: eq(reviews.userId, parseInt(userId)),
        with: { reviewer: { columns: { id: true, fullName: true, username: true, profileImg: true, email: true } } },
        orderBy: [orderByExpression], offset: skip, limit,
      }),
      db.select({ count: count() }).from(reviews).where(eq(reviews.userId, parseInt(userId))),
    ]);

    return res.json({ success: true, reviews: reviewsArray, total: Number(totalResult[0].count) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ success: false, message: 'Missing userId' });

    const uid = parseInt(userId);
    if (isNaN(uid)) return res.status(400).json({ success: false, message: 'Invalid userId' });

    const [stats] = await db.select({
      count: count(),
      avg: avg(reviews.rating),
    })
    .from(reviews)
    .where(eq(reviews.userId, uid));

    return res.json({
      success: true,
      stats: {
        avg: stats.avg ? parseFloat(stats.avg) : 0,
        count: stats.count || 0
      }
    });
  } catch (error) {
    console.error('Fetch review stats error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
