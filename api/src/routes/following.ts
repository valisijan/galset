import { Router, Request, Response } from 'express';
import { db } from '@/lib/db';
import { userFollows, users } from '@/lib/db/schema';
import { eq, count, desc } from 'drizzle-orm';
import { requireAuth } from '@/middleware/auth';

const router = Router();

// GET /following — ko prati mene (moji followers)
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '20');
    const skip = (page - 1) * limit;

    const [followers, totalResult] = await Promise.all([
      db.query.userFollows.findMany({
        where: eq(userFollows.followingId, userId),
        with: { follower: { columns: { id: true, fullName: true, username: true, profileImg: true } } },
        orderBy: [desc(userFollows.createdAt)],
        offset: skip,
        limit,
      }),
      db.select({ count: count() }).from(userFollows).where(eq(userFollows.followingId, userId)),
    ]);

    return res.json({ success: true, users: followers.map((f: any) => f.follower), total: Number(totalResult[0].count) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
