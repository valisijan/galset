import * as admin from "firebase-admin";

if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
        console.warn("⚠️ Firebase Admin: Nedostaju env varijable (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)");
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
            console.warn("⚠️ Firebase Admin nije inicijalizovan - push notifikacija nije poslana");
            return false;
        }

        await admin.messaging().send({
            token,
            notification: { title, body },
            data: data ?? {},
            webpush: {
                notification: {
                    title,
                    body,
                    icon: data?.icon || undefined,
                    badge: "/icons/badge-72x72.png",
                    requireInteraction: true,
                    tag: data?.tag, // Groups/replaces notifications with same tag
                    renotify: true, // Vibrates even if tag is the same
                    vibrate: [200, 100, 200],
                    actions: [
                        { action: "open", title: "Otvori" },
                        { action: "dismiss", title: "Zatvori" },
                    ],
                },
                fcmOptions: {
                    link: data?.link || "/inbox",
                },
            },
        });
        return true;
    } catch (err: any) {
        if (
            err?.code === "messaging/registration-token-not-registered" ||
            err?.code === "messaging/invalid-registration-token"
        ) {
            return false;
        }
        console.error("❌ Greška pri slanju push notifikacije:", err);
        return false;
    }
}
