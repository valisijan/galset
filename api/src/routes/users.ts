import { Router, Request, Response } from 'express';
import { db } from '@/lib/db';
import { users, userFollows } from '@/lib/db/schema';
import { eq, ilike, or, and, count, desc, inArray } from 'drizzle-orm';
import { optionalAuth, requireAuth } from '@/middleware/auth';

const router = Router();

// GET /users
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string) || (req.query.q as string) || '';
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '20');
    const skip = (page - 1) * limit;

    const whereClause = search
      ? or(ilike(users.username, `%${search}%`), ilike(users.fullName, `%${search}%`))
      : undefined;

    const [usersResult, totalResult] = await Promise.all([
      db.query.users.findMany({
        where: whereClause,
        columns: { id: true, fullName: true, username: true, profileImg: true, country: true, createdAt: true },
        orderBy: [desc(users.createdAt)],
        offset: skip,
        limit,
      }),
      db.select({ count: count() }).from(users).where(whereClause),
    ]);

    // Provera da li ulogovani korisnik prati korisnike iz rezultata
    const currentUserId = req.user?.id;
    let usersWithFollow = usersResult.map(u => ({ ...u, isFollowing: false }));

    if (currentUserId && usersResult.length > 0) {
      const followStatuses = await db.query.userFollows.findMany({
        where: and(
          eq(userFollows.followerId, currentUserId),
          inArray(userFollows.followingId, usersResult.map(u => u.id))
        )
      });
      const followedIds = new Set(followStatuses.map(f => f.followingId));
      usersWithFollow = usersResult.map(u => ({
        ...u,
        isFollowing: followedIds.has(u.id)
      }));
    }

    return res.json({ success: true, users: usersWithFollow, total: Number(totalResult[0].count) });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// GET /users/:id/is-following
router.get('/:id/is-following', requireAuth, async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.id;
    const targetId = parseInt(req.params.id);
    if (isNaN(targetId)) return res.status(400).json({ success: false, message: 'Invalid user ID' });

    const follow = await db.query.userFollows.findFirst({
      where: and(eq(userFollows.followerId, currentUserId), eq(userFollows.followingId, targetId)),
    });
    return res.json({ success: true, isFollowing: !!follow });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
