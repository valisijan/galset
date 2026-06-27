// @ts-nocheck
import { Router, Request, Response } from 'express';
import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { eq, desc, count, isNull, and, ne } from 'drizzle-orm';
import { requireAuth } from '@/middleware/auth';

const router = Router();

// GET /notifications/unread-count
router.get('/unread-count', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const [result] = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false),
          ne(notifications.type, 'MESSAGE_REACTION')
        )
      );
    return res.json({ success: true, count: Number(result.count) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// GET /notifications
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '20');
    const skip = (page - 1) * limit;

    const whereClause = and(
      eq(notifications.userId, userId),
      ne(notifications.type, 'MESSAGE_REACTION')
    );
    const [notificationsResult, totalResult, unreadResult] = await Promise.all([
      db.query.notifications.findMany({ where: whereClause, orderBy: [desc(notifications.createdAt)], offset: skip, limit }),
      db.select({ count: count() }).from(notifications).where(whereClause),
      db.select({ count: count() }).from(notifications).where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false),
          ne(notifications.type, 'MESSAGE_REACTION')
        )
      ),
    ]);

    return res.json({
      success: true,
      notifications: notificationsResult,
      total: Number(totalResult[0].count),
      unreadCount: Number(unreadResult[0].count),
    });
  } catch (error) {
    console.error('Notifications GET API Error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /notifications — mark all as read (sets isRead=true AND readAt=now)
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    await db.update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false),
          ne(notifications.type, 'MESSAGE_REACTION')
        )
      );
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
