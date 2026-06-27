// @ts-nocheck
import { Router, Request, Response } from 'express';
import { db } from '@/lib/db';
import { reports } from '@/lib/db/schema';
import { requireAuth } from '@/middleware/auth';

const router = Router();

// POST /report
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { targetType, targetId, reason, description } = req.body;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    await db.insert(reports).values({ userId, targetType, targetId: parseInt(targetId), reason, description: description || null });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
