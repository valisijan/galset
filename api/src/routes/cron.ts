import { Router, Request, Response } from 'express';
import { db } from '@/lib/db';
import { tempImages, users, adPromotions, ads, notifications, drafts } from '@/lib/db/schema';
import { and, eq, lt, isNotNull, isNull, ne } from 'drizzle-orm';
import { supabase } from '@/lib/supabase';
import { createNotification } from '@/lib/notification-helpers';

const router = Router();

// GET /cron/cleanup
router.get('/cleanup', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const now = new Date();

    // Fetch all active draft image URLs so they are not deleted
    const activeDrafts = await db.select({ images: drafts.images }).from(drafts);
    const draftImageUrls = new Set<string>();
    activeDrafts.forEach(d => {
      if (d.images && Array.isArray(d.images)) {
        d.images.forEach(url => draftImageUrls.add(url));
      }
    });

    // 1. Cleanup stale temp images
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const staleImages = await db.select().from(tempImages).where(and(eq(tempImages.isPublished, false), lt(tempImages.createdAt, cutoff)));

    // Filter staleImages to exclude any image URL currently stored in active drafts
    const imagesToDelete = staleImages.filter(img => !draftImageUrls.has(img.url));

    let deletedImageCount = 0;
    const imageErrors: string[] = [];

    for (const img of imagesToDelete) {
      try {
        try {
          const { error } = await supabase.storage.from('images').remove([img.fileId]);
          if (error) throw error;
        } catch (storageErr: any) {
          if (storageErr?.status === 404 || storageErr?.message?.includes('not exist') || storageErr?.message?.includes('not found')) {
            console.log(`Image ${img.id} already missing from Supabase storage`);
          } else {
            throw storageErr;
          }
        }
        await db.delete(tempImages).where(eq(tempImages.id, img.id));
        deletedImageCount++;
      } catch (err) {
        console.error(`Failed to cleanup temp image ${img.id}:`, err);
        imageErrors.push(`${img.id}: ${err}`);
      }
    }

    // 2. Permanently delete accounts scheduled for deletion (Removed as accounts are now deleted immediately)
    const deletedAccountCount = 0;
    const accountsToDelete: any[] = [];
    const accountErrors: any[] = [];

    // 3. Cleanup expired promotions & notify owners
    let deletedPromotionsCount = 0;
    let expiredPromoNotifCount = 0;
    try {
      // Find promotions that are about to expire (expiresAt < now) along with ad/owner info
      const expiredPromotionsList = await db
        .select({
          promoId: adPromotions.id,
          promoType: adPromotions.type,
          adId: ads.id,
          adTitle: ads.title,
          userId: ads.userId,
          adImages: ads.images,
        })
        .from(adPromotions)
        .innerJoin(ads, eq(adPromotions.adId, ads.id))
        .where(lt(adPromotions.expiresAt, now));

      for (const promo of expiredPromotionsList) {
        const imageUrl = (promo.adImages && promo.adImages.length > 0) ? promo.adImages[0] : undefined;
        await createNotification({
          userId: promo.userId,
          type: 'PROMOTION_EXPIRED',
          title: 'Vaša promocija je istekla',
          body: `Promocija za vaš oglas "${promo.adTitle}" je istekla.`,
          imageUrl,
          actionUrl: `/ads/${promo.adId}`,
          adId: promo.adId,
          sendPush: true,
        });
        expiredPromoNotifCount++;
      }

      if (expiredPromotionsList.length > 0) {
        const deleteResult = await db.delete(adPromotions).where(lt(adPromotions.expiresAt, now));
        deletedPromotionsCount = deleteResult.rowCount || 0;
      }
      console.log(`[CRON] Cleaned up ${deletedPromotionsCount} expired promotions and sent ${expiredPromoNotifCount} notifications`);
    } catch (promoErr) {
      console.error('[CRON] Failed to cleanup expired promotions:', promoErr);
    }

    // 3b. Mark active ads as EXPIRED if they have passed expiresAt
    let markedExpiredCount = 0;
    try {
      const updateResult = await db.update(ads)
        .set({ status: 'EXPIRED' })
        .where(and(eq(ads.status, 'ACTIVE'), lt(ads.expiresAt, now)));
      markedExpiredCount = updateResult.rowCount || 0;
      console.log(`[CRON] Marked ${markedExpiredCount} ads as EXPIRED`);
    } catch (expireErr) {
      console.error('[CRON] Failed to mark ads as EXPIRED:', expireErr);
    }

    // 4. Notify owners of expired ads (only if no notification sent yet)
    let expiredNotifCount = 0;
    try {
      // Nađi oglase koji su EXPIRED a vlasnik nije dobio AD_EXPIRED notifikaciju
      const expiredAds = await db.query.ads.findMany({
        where: eq(ads.status, 'EXPIRED'),
        columns: { id: true, title: true, images: true, userId: true },
      });

      for (const ad of expiredAds) {
        // Provjeri da li već postoji notifikacija za ovaj oglas
        const existing = await db.query.notifications.findFirst({
          where: and(
            eq(notifications.userId, ad.userId),
            eq(notifications.type, 'AD_EXPIRED'),
            isNotNull(notifications.adId),
          ),
          columns: { adId: true },
        });

        // Ako postoji notif sa istim adId — preskoči
        const alreadyNotified = existing && (existing as any).adId === ad.id;
        if (alreadyNotified) continue;

        // Provjeri da li ova specifična notif postoji (direktni SQL)
        const [existingForAd] = await db
          .select({ id: notifications.id })
          .from(notifications)
          .where(
            and(
              eq(notifications.userId, ad.userId),
              eq(notifications.type, 'AD_EXPIRED'),
              eq(notifications.adId, ad.id),
            )
          )
          .limit(1);

        if (existingForAd) continue;

        const imageUrl = (ad.images && ad.images.length > 0) ? ad.images[0] : undefined;
        await createNotification({
          userId: ad.userId,
          type: 'AD_EXPIRED',
          title: 'Oglas je istekao',
          body: `Vaš oglas "${ad.title}" je istekao. Obnovite ga i vratite ga među aktivne oglase ponovo.`,
          imageUrl,
          actionUrl: `/ads/${ad.id}`,
          adId: ad.id,
          sendPush: true,
        });
        expiredNotifCount++;
      }

      console.log(`[CRON] Sent ${expiredNotifCount} expired ad notifications`);
    } catch (expiredErr) {
      console.error('[CRON] Failed to send expired ad notifications:', expiredErr);
    }

    // 5. Brisanje pročitanih notifikacija starijih od 24h
    let deletedNotifCount = 0;
    try {
      const cutoff24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const deleteResult = await db
        .delete(notifications)
        .where(
          and(
            isNotNull(notifications.readAt),
            lt(notifications.readAt, cutoff24h),
          )
        );
      deletedNotifCount = deleteResult.rowCount || 0;
      console.log(`[CRON] Deleted ${deletedNotifCount} read notifications older than 24h`);
    } catch (notifErr) {
      console.error('[CRON] Failed to delete read notifications:', notifErr);
    }

    // 6. Cleanup drafts older than 7 days
    let deletedDraftsCount = 0;
    try {
      const draftCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const deleteResult = await db.delete(drafts).where(lt(drafts.createdAt, draftCutoff));
      deletedDraftsCount = deleteResult.rowCount || 0;
      console.log(`[CRON] Cleaned up ${deletedDraftsCount} stale drafts`);
    } catch (draftErr) {
      console.error('[CRON] Failed to cleanup stale drafts:', draftErr);
    }


    // 8. Cleanup expired ads (where deletedAt is in the past)
    let deletedAdsCount = 0;
    try {
      const deleteResult = await db.delete(ads).where(lt(ads.deletedAt, now));
      deletedAdsCount = deleteResult.rowCount || 0;
      console.log(`[CRON] Cleaned up ${deletedAdsCount} expired ads`);
    } catch (adErr) {
      console.error('[CRON] Failed to cleanup expired ads:', adErr);
    }

    return res.json({
      images: { deleted: deletedImageCount, total: imagesToDelete.length, errors: imageErrors.length > 0 ? imageErrors : undefined },
      accounts: { deleted: deletedAccountCount, total: accountsToDelete.length, errors: accountErrors.length > 0 ? accountErrors : undefined },
      promotions: { deleted: deletedPromotionsCount },
      expiredAdsNotifications: { sent: expiredNotifCount },
      expiredPromotionsNotifications: { sent: expiredPromoNotifCount },
      readNotificationsDeleted: deletedNotifCount,
      drafts: { deleted: deletedDraftsCount },
      ads: { deleted: deletedAdsCount, markedExpired: markedExpiredCount }
    });
  } catch (err) {
    console.error('[CRON] Cleanup error:', err);
    return res.status(500).json({ error: 'Cleanup failed' });
  }
});

export default router;
