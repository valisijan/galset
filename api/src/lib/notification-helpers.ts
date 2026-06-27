import { db } from './db';
import { notifications } from './db/schema';
import { sendPushToUser } from './push-helpers';

interface CreateNotificationParams {
  userId: number;
  type: string;
  title: string;
  body: string;
  imageUrl?: string;
  actionUrl?: string;
  senderId?: number;
  adId?: number;
  sendPush?: boolean;
}

export async function createNotification(params: CreateNotificationParams) {
  const {
    userId, type, title, body, imageUrl, actionUrl,
    senderId, adId, sendPush = true,
  } = params;

  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 365);

    await db.insert(notifications).values({
      userId,
      type,
      title,
      body,
      imageUrl: imageUrl || null,
      actionUrl: actionUrl || null,
      senderId: senderId || null,
      adId: adId || null,
      expiresAt,
    });

    if (sendPush) {
      const pushData: Record<string, string> = {
        link: actionUrl || '/notifications',
      };
      if (imageUrl && type !== 'USER_FOLLOW' && type !== 'AD_WISHLIST') {
        pushData.icon = imageUrl.split("|||")[0];
      }

      let prefType: 'messages' | 'expiredAds' | 'expiredPromotions' | 'followedAds' | 'newFollowers' | 'newReviews' | undefined;
      if (type === 'AD_WISHLIST') prefType = 'followedAds';
      else if (type === 'MESSAGE_REACTION') prefType = 'messages';
      else if (type === 'USER_FOLLOW') prefType = 'newFollowers';
      else if (type === 'AD_EXPIRED') prefType = 'expiredAds';
      else if (type === 'NEW_REVIEW') prefType = 'newReviews';
      else if (type === 'PROMOTION_EXPIRED') prefType = 'expiredPromotions';

      sendPushToUser({
        userId,
        title,
        body,
        data: pushData,
        type: prefType,
      }).catch(err => console.error('❌ Push send failed:', err));
    }

  } catch (err) {
    console.error('❌ Failed to create notification:', err);
  }
}
