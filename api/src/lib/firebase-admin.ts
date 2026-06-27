import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      '⚠️ Firebase Admin: Nedostaju env varijable (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)'
    );
  } else {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }
}

export { admin };

export async function sendPushNotification({
  token,
  title,
  body,
  data,
}: {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}): Promise<boolean> {
  try {
    if (!admin.apps.length) {
      console.warn('⚠️ Firebase Admin nije inicijalizovan - push notifikacija nije poslana');
      return false;
    }

    const pushData: Record<string, string> = {
      title,
      body,
      ...(data ?? {}),
    };

    await admin.messaging().send({
      token,
      notification: { title, body },
      data: pushData,
      webpush: {
        notification: {
          title,
          body,
          icon: data?.icon || undefined,
          tag: data?.tag || undefined,
          renotify: !!data?.tag,
          requireInteraction: true,
        },
        data: pushData,
        headers: { Urgency: 'high' },
        fcmOptions: {
          link: data?.link || '/notifications',
        },
      },
    });
    return true;
  } catch (err: any) {
    if (
      err?.code === 'messaging/registration-token-not-registered' ||
      err?.code === 'messaging/invalid-registration-token'
    ) {
      return false;
    }
    console.error('❌ Greška pri slanju push notifikacije:', err);
    return false;
  }
}
