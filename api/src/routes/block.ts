import { Router, Request, Response } from 'express';
import { db } from '@/lib/db';
import { blockedUsers, users } from '@/lib/db/schema';
import { eq, and, or } from 'drizzle-orm';
import { requireAuth } from '@/middleware/auth';

const router = Router();

// GET /block/list — lista blokiranih korisnika
router.get('/list', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const blocked = await db
      .select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        profileImg: users.profileImg
      })
      .from(blockedUsers)
      .innerJoin(users, eq(blockedUsers.blockedId, users.id))
      .where(eq(blockedUsers.blockerId, userId));

    return res.json({ success: true, blockedUsers: blocked });
  } catch (error) {
    console.error('Error fetching blocked list:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// GET /block/status — provera statusa blokiranja
router.get('/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const targetUserId = req.query.userId;
    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'Missing userId' });
    }

    const targetId = parseInt(targetUserId as string);

    const blocks = await db.query.blockedUsers.findMany({
      where: or(
        and(
          eq(blockedUsers.blockerId, userId),
          eq(blockedUsers.blockedId, targetId)
        ),
        and(
          eq(blockedUsers.blockerId, targetId),
          eq(blockedUsers.blockedId, userId)
        )
      )
    });

    const isBlockedByMe = blocks.some(b => b.blockerId === userId);
    const amIBlocked = blocks.some(b => b.blockerId === targetId);

    return res.json({
      success: true,
      isBlockedByMe,
      amIBlocked,
      anyBlock: isBlockedByMe || amIBlocked
    });
  } catch (error) {
    console.error('Error checking block status:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// GET /block — lista blokiranih korisnika (fallback)
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const blocked = await db.query.blockedUsers.findMany({
      where: eq(blockedUsers.blockerId, userId),
      with: { blocked: { columns: { id: true, fullName: true, username: true, profileImg: true } } },
    });
    return res.json({ success: true, blocked: blocked.map((b: any) => b.blocked) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /block — toggle block
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { blockedId } = req.body;
    if (!blockedId) return res.status(400).json({ success: false, message: 'Missing blockedId' });

    const targetId = parseInt(blockedId);
    const existing = await db.query.blockedUsers.findFirst({ where: and(eq(blockedUsers.blockerId, userId), eq(blockedUsers.blockedId, targetId)) });

    if (existing) {
      await db.delete(blockedUsers).where(eq(blockedUsers.id, existing.id));
      return res.json({ success: true, isBlocked: false });
    } else {
      await db.insert(blockedUsers).values({ blockerId: userId, blockedId: targetId });
      return res.json({ success: true, isBlocked: true });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// DELETE /block — deblokiranje korisnika
router.delete('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { blockedId } = req.body;
    if (!blockedId) return res.status(400).json({ success: false, message: 'Missing blockedId' });

    const targetId = parseInt(blockedId);
    await db.delete(blockedUsers).where(
      and(
        eq(blockedUsers.blockerId, userId),
        eq(blockedUsers.blockedId, targetId)
      )
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting block:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
