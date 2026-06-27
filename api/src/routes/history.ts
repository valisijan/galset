import { Router, Request, Response } from 'express';
import { db } from '@/lib/db';
import { adViews, ads } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth, optionalAuth } from '@/middleware/auth';

const router = Router();

// GET /history
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '20');
    const skip = (page - 1) * limit;

    const historyItems = await db.query.adViews.findMany({
      where: eq(adViews.userId, userId),
      orderBy: [desc(adViews.updatedAt)],
      offset: skip,
      limit,
      with: {
        ad: {
          with: {
            user: { columns: { id: true, fullName: true, username: true, profileImg: true } },
            promotions: {
              where: (adPromotions, { gt }) => gt(adPromotions.expiresAt, new Date())
            }
          },
        },
      },
    });

    const adsList = historyItems.map((h: any) => h.ad).filter(Boolean);

    return res.json({ success: true, history: adsList, ads: adsList });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /history/sync — sinhronizuj više pregleda oglasa
router.post('/sync', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { adIds } = req.body;
    if (!adIds || !Array.isArray(adIds) || adIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid adIds' });
    }

    const valuesToInsert = adIds.map((id: any) => ({
      userId,
      adId: parseInt(id)
    }));

    await db.insert(adViews)
      .values(valuesToInsert)
      .onConflictDoUpdate({
        target: [adViews.userId, adViews.adId],
        set: { updatedAt: new Date() }
      });

    return res.json({ success: true });
  } catch (error) {
    console.error("Failed to sync history:", error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /history — zabelezi pregled oglasa
router.post('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { adId } = req.body;
    if (!adId) return res.status(400).json({ success: false });

    // Determine the userId from req.user (optional token) or fallback to req.body.userId
    let userIdVal: number | null = null;
    if (req.user?.id) {
      userIdVal = req.user.id;
    } else if (req.body.userId) {
      userIdVal = parseInt(req.body.userId);
    }

    await db.insert(adViews)
      .values({ 
        adId: parseInt(adId), 
        userId: userIdVal 
      })
      .onConflictDoUpdate({
        target: [adViews.userId, adViews.adId],
        set: { updatedAt: new Date() }
      });
    
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
});

export default router;

