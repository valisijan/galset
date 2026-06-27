import { Router, Request, Response } from 'express';
import { db } from '@/lib/db';
import { userFollows, users } from '@/lib/db/schema';
import { eq, and, or, ilike, inArray, count, desc, sql } from 'drizzle-orm';
import { requireAuth } from '@/middleware/auth';
import { createNotification } from '@/lib/notification-helpers';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const search = (req.query.search as string) || '';
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '20');
    const skip = (page - 1) * limit;

    let userCondition: any = undefined;
    if (search) {
      const matchingUsers = await db.query.users.findMany({ where: or(ilike(users.username, `%${search}%`), ilike(users.fullName, `%${search}%`)), columns: { id: true } });
      const matchIds = matchingUsers.map((u: any) => u.id);
      userCondition = matchIds.length > 0 ? inArray(userFollows.followingId, matchIds) : sql`false`;
    }

    const whereClause: any = search ? and(eq(userFollows.followerId, userId), userCondition) : eq(userFollows.followerId, userId);
    const [followingResult, totalResult] = await Promise.all([
      db.query.userFollows.findMany({
        where: whereClause,
        with: { following: { columns: { id: true, fullName: true, username: true, profileImg: true, createdAt: true }, with: { reviewsReceived: { columns: { rating: true } } } } },
        orderBy: [desc(userFollows.createdAt)], offset: skip, limit,
      }),
      db.select({ count: count() }).from(userFollows).where(whereClause),
    ]);

    const mappedUsers = followingResult.map((f: any) => {
      const reviews = f.following?.reviewsReceived || [];
      const ratingCount = reviews.length;
      const rating = ratingCount > 0 ? reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0) / ratingCount : 0;
      return { id: f.following.id, fullName: f.following.fullName, username: f.following.username, profileImg: f.following.profileImg, createdAt: f.following.createdAt?.toISOString(), rating: parseFloat(rating.toFixed(1)), ratingCount };
    });

    return res.json({ success: true, users: mappedUsers, total: Number(totalResult[0].count) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { followingId } = req.body;
    if (!followingId) return res.status(400).json({ success: false, message: 'Missing followingId' });
    const targetId = parseInt(followingId);
    const existingFollow = await db.query.userFollows.findFirst({ where: and(eq(userFollows.followerId, userId), eq(userFollows.followingId, targetId)) });
    if (existingFollow) {
      await db.delete(userFollows).where(eq(userFollows.id, existingFollow.id));
      return res.json({ success: true, isFollowing: false });
    } else {
      await db.insert(userFollows).values({ followerId: userId, followingId: targetId });

      // Pošalji notifikaciju zapraćenom korisniku
      try {
        const follower = await db.query.users.findFirst({
          where: eq(users.id, userId),
          columns: { id: true, username: true, fullName: true, profileImg: true },
        });
        if (follower) {
          const displayName = follower.username || follower.fullName || 'Neko';
          await createNotification({
            userId: targetId,
            type: 'USER_FOLLOW',
            title: 'Novi pratilac',
            body: `Korisnik ${displayName} vas je zapratio.`,
            imageUrl: follower.profileImg || undefined,
            actionUrl: `/${follower.username || follower.id}`,
            senderId: userId,
          });
        }
      } catch (notifErr) {
        console.error('Failed to send follow notification:', notifErr);
      }

      return res.json({ success: true, isFollowing: true });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
