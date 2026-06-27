import { Router, Request, Response } from 'express';
import { db } from '@/lib/db';
import { pricing } from '@/lib/db/schema';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const data = await db.select().from(pricing);
    return res.json({ success: true, pricing: data });
  } catch (err: any) {
    console.error('Error fetching pricing:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

export default router;
