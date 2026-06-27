import { Router, Request, Response } from 'express';
import { db } from '@/lib/db';
import { pushTokens } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { sendPushToUser } from '@/lib/push-helpers';
import { requireAuth } from '@/middleware/auth';

const router = Router();

// POST /push/send
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { userId, title, body, data } = req.body;
    if (!userId || !title || !body) {
      return res.status(400).json({ success: false, error: 'Missing fields' });
    }
    await sendPushToUser({ userId: Number(userId), title, body, data });
    return res.json({ success: true });
  } catch (err) {
    console.error('❌ Push API greška:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /push/save-token
router.post('/save-token', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { token } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid token' });
    }

    await db.insert(pushTokens).values({
      userId,
      token,
      updatedAt: new Date(),
      createdAt: new Date(),
    }).onConflictDoUpdate({
      target: pushTokens.token,
      set: {
        userId,
        updatedAt: new Date(),
      }
    });

    console.log(`✅ FCM token sačuvan za korisnika ${userId}`);
    return res.json({ success: true });
  } catch (err) {
    console.error('❌ Greška pri čuvanju FCM tokena:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /push/delete-token
router.post('/delete-token', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { token } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid token' });
    }

    await db.delete(pushTokens).where(
      and(
        eq(pushTokens.token, token),
        eq(pushTokens.userId, userId)
      )
    );

    console.log(`❌ FCM token obrisan za korisnika ${userId}`);
    return res.json({ success: true });
  } catch (err) {
    console.error('❌ Greška pri brisanju FCM tokena:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
