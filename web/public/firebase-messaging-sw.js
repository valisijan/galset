self.addEventListener("install", (event) => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
    console.log("[SW] Primljen push događaj:", event);
    if (!event.data) return;

    event.stopImmediatePropagation();

    const promiseChain = (async () => {
        try {
            const payload = event.data.json();
            console.log("[SW] Parsiran payload:", payload);

            const data = payload.data || {};
            const notification = payload.notification || {};

            const title = data.title || notification.title || "Nova obavijest";
            const body = data.body || notification.body || "";
            const link = data.link || "/notifications";
            const tag = data.tag || undefined;
            const iconUrl = data.icon || notification.icon || undefined;

            const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });

            if (tag && tag.startsWith("msg-")) {
                const conversationId = tag.replace("msg-", "");
                const isActiveInChat = allClients.some(
                    (c) => c.url.includes(`/inbox/${conversationId}`) && c.visibilityState === "visible"
                );
                if (isActiveInChat) {
                    console.log("[SW] Korisnik je aktivan u chatu, potiskujem notifikaciju");
                    return;
                }
            } else {
                const isActiveOnNotifications = allClients.some(
                    (c) => c.url.includes("/notifications") && c.visibilityState === "visible"
                );
                if (isActiveOnNotifications) {
                    console.log("[SW] Korisnik je aktivan na /notifications, potiskujem notifikaciju");
                    return;
                }
            }

            const icon = iconUrl;

            await self.registration.showNotification(title, {
                body,
                icon,
                tag,
                renotify: !!tag,
                requireInteraction: true,
                vibrate: [200, 100, 200],
                data: { link, ...data },
                actions: [
                    { action: "open", title: "Otvori" },
                    { action: "dismiss", title: "Zatvori" },
                ],
            });

            allClients.forEach((client) => {
                client.postMessage({
                    type: "FCM_FOREGROUND_EVENT",
                    payload,
                });
            });
        } catch (e) {
            console.error("[SW] Greška u native push handleru:", e);
            await self.registration.showNotification("Nova obavijest", {
                body: "Imate novu obavijest na Galsetu.",
            });
        }
    })();

    event.waitUntil(promiseChain);
});

importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSy" + "Cex9EkdYCryw5w3rDYeC5PMQYtuNbVYi0",
    authDomain: "galset-studio.firebaseapp.com",
    projectId: "galset-studio",
    storageBucket: "galset-studio.firebasestorage.app",
    messagingSenderId: "367186759854",
    appId: "1:367186759854:web:b249dfcd838f5c9dc85d3f",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(async (payload) => {
    console.log("[SW] Primljena pozadinska poruka:", payload);

    const data = payload.data || {};
    const title = data.title || payload.notification?.title || "Nova obavijest";
    const body = data.body || payload.notification?.body || "";
    const link = data.link || "/notifications";
    const tag = data.tag || undefined;
    const iconUrl = data.icon || payload.notification?.icon || undefined;

    if (tag) {
        const existing = await self.registration.getNotifications({ tag });
        existing.forEach((n) => n.close());
    }

    const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });

    if (tag && tag.startsWith("msg-")) {
        const conversationId = tag.replace("msg-", "");
        const isActiveInChat = allClients.some(
            (c) => c.url.includes(`/inbox/${conversationId}`) && c.visibilityState === "visible"
        );
        if (isActiveInChat) {
            console.log("[SW] Korisnik je aktivan u chatu, potiskujem notifikaciju");
            return;
        }
    } else {
        const isActiveOnNotifications = allClients.some(
            (c) => c.url.includes("/notifications") && c.visibilityState === "visible"
        );
        if (isActiveOnNotifications) {
            console.log("[SW] Korisnik je aktivan na /notifications, potiskujem notifikaciju");
            return;
        }
    }

    const icon = iconUrl;

    return self.registration.showNotification(title, {
        body,
        icon,
        tag,
        renotify: !!tag,
        requireInteraction: true,
        vibrate: [200, 100, 200],
        data: { link, ...data },
        actions: [
            { action: "open", title: "Otvori" },
            { action: "dismiss", title: "Zatvori" },
        ],
    });
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    if (event.action === "dismiss") return;

    const link = event.notification.data?.link || "/notifications";
    const absoluteLink = link.startsWith("http")
        ? link
        : self.location.origin + link;

    event.waitUntil(
        clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then(async (clientList) => {
                for (const client of clientList) {
                    if (client.url.startsWith(self.location.origin) && "navigate" in client) {
                        try {
                            const navigated = await client.navigate(absoluteLink);
                            if (navigated) {
                                await navigated.focus();
                            } else {
                                await client.focus();
                            }
                            return;
                        } catch (e) {
                            break;
                        }
                    }
                }
                return clients.openWindow(absoluteLink);
            })
    );
});

