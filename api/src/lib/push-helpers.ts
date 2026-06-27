import { db } from '@/lib/db';
import { pushTokens, notificationPreferences } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { sendPushNotification } from './firebase-admin';

export async function sendPushToUser({
  userId,
  title,
  body,
  data,
  type,
}: {
  userId: number;
  title: string;
  body: string;
  data?: Record<string, string>;
  type?: 'messages' | 'expiredAds' | 'expiredPromotions' | 'followedAds' | 'newFollowers' | 'newReviews';
}) {
  try {
    console.log(`[PUSH] sendPushToUser triggered for userId: ${userId}, title: "${title}"`);

    if (type) {
      const prefs = await db.query.notificationPreferences.findFirst({
        where: eq(notificationPreferences.userId, userId)
      });
      const isEnabled = prefs ? prefs[type] : true;
      if (!isEnabled) {
        console.log(`[PUSH] Push notification skipped for userId: ${userId} because preference "${type}" is disabled.`);
        return;
      }
    }

    const tokens = await db.select().from(pushTokens).where(eq(pushTokens.userId, userId));
    console.log(`[PUSH] Found ${tokens.length} tokens for userId: ${userId}`);

    if (!tokens.length) return;

    const invalidTokens: string[] = [];

    await Promise.all(
      tokens.map(async (doc) => {
        const ok = await sendPushNotification({ token: doc.token, title, body, data });
        if (!ok) {
          invalidTokens.push(doc.token);
        }
      })
    );

    if (invalidTokens.length) {
      await db.delete(pushTokens).where(inArray(pushTokens.token, invalidTokens));
      console.log(`[PUSH] Cleaned up ${invalidTokens.length} invalid tokens`);
    }
  } catch (err: any) {
    console.error('❌ Greška pri slanju push notifikacije korisniku:', err);
  }
}
