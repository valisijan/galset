// @ts-nocheck
import { Router, Request, Response } from 'express';
import { db } from '@/lib/db';
import { users, tempImages, notificationPreferences, ads } from '@/lib/db/schema';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { requireAuth } from '@/middleware/auth';
import { supabase } from '@/lib/supabase';

const router = Router();

// GET /account
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, fullName: true, username: true, email: true, country: true, city: true, address: true, phone: true, birthDate: true, profileImg: true, description: true },
  });
  return res.json({ user });
});

// PUT /account
router.put('/', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const body = req.body;

  const allowedFields = ['fullName', 'username', 'email', 'country', 'city', 'address', 'phone', 'birthDate', 'profileImg', 'description'];
  const data: Record<string, any> = {};

  if (body.email) {
    const existing = await db.query.users.findFirst({ where: eq(users.email, body.email) });
    if (existing && existing.id !== userId) {
      return res.status(400).json({ error: 'Email adresa je već u upotrebi' });
    }
  }

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      if (field === 'birthDate') {
        const date = new Date(body[field]);
        if (!isNaN(date.getTime())) data.birthDate = date;
      } else {
        data[field] = body[field] !== undefined ? body[field] : null;
      }
    }
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'Nema podataka za izmenu' });
  }

  if (data.profileImg !== undefined) {
    const { originalTempImageId, cropTempImageId } = body as { originalTempImageId?: number; cropTempImageId?: number };

    await db.update(tempImages).set({ isPublished: false }).where(
      and(eq(tempImages.userId, userId), eq(tempImages.isPublished, true), inArray(tempImages.imageType, ['profile_original', 'profile_crop']))
    );

    const newIds: number[] = [];
    if (originalTempImageId) newIds.push(originalTempImageId);
    if (cropTempImageId) newIds.push(cropTempImageId);
    if (newIds.length > 0) {
      await db.update(tempImages).set({ isPublished: true }).where(and(eq(tempImages.userId, userId), inArray(tempImages.id, newIds)));
    }
  }

  const [updatedUser] = await db.update(users).set(data).where(eq(users.id, userId)).returning({
    id: users.id, fullName: users.fullName, username: users.username, email: users.email,
    country: users.country, city: users.city, address: users.address, phone: users.phone,
    birthDate: users.birthDate, profileImg: users.profileImg, description: users.description,
  });

  return res.json({ success: true, user: updatedUser });
});

// DELETE /account
router.delete('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { supabaseId: true }
    });

    if (user?.supabaseId) {
      // Delete user from Supabase auth using admin client
      const { error: sbDeleteError } = await supabase.auth.admin.deleteUser(user.supabaseId);
      if (sbDeleteError) {
        console.error('[delete-account] Supabase Auth deletion error:', sbDeleteError.message);
      }
      // Delete all user sessions
      await db.execute(sql`DELETE FROM auth.sessions WHERE user_id = ${user.supabaseId}::uuid`);
    }

    // 1. Find or create the special "Obrisan korisnik" user
    let deletedUser = await db.query.users.findFirst({
      where: eq(users.username, 'obrisan_korisnik')
    });

    if (!deletedUser) {
      const [newDeletedUser] = await db.insert(users).values({
        email: 'obrisan@galset.com',
        username: 'obrisan_korisnik',
        fullName: 'Obrisan korisnik',
      }).returning();
      deletedUser = newDeletedUser;
    }

    const specialUserId = deletedUser.id;

    // 2. Re-assign user's Chat, Message, and Review to "Obrisan korisnik"
    const { chats, messages, reviews } = await import('@/lib/db/schema');

    // Update chats
    await db.update(chats).set({ user1Id: specialUserId }).where(eq(chats.user1Id, userId));
    await db.update(chats).set({ user2Id: specialUserId }).where(eq(chats.user2Id, userId));

    // Update messages
    await db.update(messages).set({ senderId: specialUserId }).where(eq(messages.senderId, userId));
    await db.update(messages).set({ receiverId: specialUserId }).where(eq(messages.receiverId, userId));

    // Update reviews
    await db.update(reviews).set({ reviewerId: specialUserId }).where(eq(reviews.reviewerId, userId));
    await db.update(reviews).set({ userId: specialUserId }).where(eq(reviews.userId, userId));

    // 3. Delete the user from users table (cascading deletes will handle ads, wishlists, wallet, transaction, aichats, aimessages, etc.)
    await db.delete(users).where(eq(users.id, userId));

    return res.json({ success: true });
  } catch (err) {
    console.error('[delete-account] Error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /account/deactivate
router.post('/deactivate', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Set isDeactivated to true
    await db.update(users).set({ isDeactivated: true }).where(eq(users.id, userId));

    // Hide all user's ads
    await db.update(ads).set({ status: 'DEACTIVATED' }).where(and(eq(ads.userId, userId), eq(ads.status, 'ACTIVE')));

    // Delete all sessions to force sign-out
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { supabaseId: true }
    });

    if (user?.supabaseId) {
      await db.execute(sql`DELETE FROM auth.sessions WHERE user_id = ${user.supabaseId}::uuid`);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('[deactivate-account] Error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /account/notification-preferences
router.get('/notification-preferences', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    let prefs = await db.query.notificationPreferences.findFirst({
      where: eq(notificationPreferences.userId, userId)
    });
    if (!prefs) {
      const [newPrefs] = await db.insert(notificationPreferences).values({
        userId,
      }).returning();
      prefs = newPrefs;
    }
    return res.json({ success: true, preferences: prefs });
  } catch (err: any) {
    console.error('Error fetching notification preferences:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PATCH /account/notification-preferences
router.patch('/notification-preferences', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { messages, expiredAds, expiredPromotions, followedAds, newFollowers, newReviews } = req.body;

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };
    if (messages !== undefined) updateData.messages = !!messages;
    if (expiredAds !== undefined) updateData.expiredAds = !!expiredAds;
    if (expiredPromotions !== undefined) updateData.expiredPromotions = !!expiredPromotions;
    if (followedAds !== undefined) updateData.followedAds = !!followedAds;
    if (newFollowers !== undefined) updateData.newFollowers = !!newFollowers;
    if (newReviews !== undefined) updateData.newReviews = !!newReviews;

    // Check if preferences exist first, if not create default, otherwise update
    let prefs = await db.query.notificationPreferences.findFirst({
      where: eq(notificationPreferences.userId, userId)
    });

    let result;
    if (!prefs) {
      const [newPrefs] = await db.insert(notificationPreferences).values({
        userId,
        ...updateData
      }).returning();
      result = newPrefs;
    } else {
      const [updated] = await db.update(notificationPreferences)
        .set(updateData)
        .where(eq(notificationPreferences.userId, userId))
        .returning();
      result = updated;
    }

    return res.json({ success: true, preferences: result });
  } catch (err: any) {
    console.error('Error updating notification preferences:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
