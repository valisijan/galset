// @ts-nocheck
import { Router, Request, Response } from 'express';
import { db } from '@/lib/db';
import { reportIssues } from '@/lib/db/schema';
import { optionalAuth } from '@/middleware/auth';

const router = Router();

// POST /report-issue
router.post('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id ?? null;
    const { targetType, description } = req.body;

    if (!targetType || !description) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    await db.insert(reportIssues).values({ userId: userId ?? undefined, targetType, description });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
