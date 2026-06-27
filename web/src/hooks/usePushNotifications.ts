"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getFirebaseMessaging } from "@/lib/firebase";
import { getToken, onMessage } from "firebase/messaging";

import { useAuth } from "@/context/AuthContext";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;


export function usePushNotifications(userId?: number) {
    const { sessionToken } = useAuth();
    const initialized = useRef(false);
    const [permission, setPermission] = useState<NotificationPermission>("default");
    const [isSupported, setIsSupported] = useState<boolean>(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setPermission(Notification.permission);
            setIsSupported("Notification" in window && "serviceWorker" in navigator);
        }
    }, []);

    const enableNotifications = useCallback(async () => {
        if (!userId || !sessionToken) return;
        if (!isSupported) return;

        setLoading(true);
        try {
            const registration = await navigator.serviceWorker.register(
                "/firebase-messaging-sw.js",
                { scope: "/" }
            );
            console.log("✅ Service Worker registrovan");

            let currentPermission = Notification.permission;
            if (currentPermission !== "granted") {
                currentPermission = await Notification.requestPermission();
                setPermission(currentPermission);
            }

            if (currentPermission !== "granted") {
                console.log("🔕 Dozvola za notifikacije nije data");
                setLoading(false);
                return false;
            }

            console.log("🔔 Dozvola za notifikacije odobrena");

            const messaging = getFirebaseMessaging();
            if (!messaging) {
                setLoading(false);
                return false;
            }

            const token = await getToken(messaging, {
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: registration,
            });

            if (!token) {
                console.warn("⚠️ Nije moguće dohvatiti FCM token");
                setLoading(false);
                return false;
            }

            console.log("📲 FCM token dohvaćen:", token.slice(0, 20) + "...");

            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/push/save-token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionToken}`
                },
                body: JSON.stringify({ token }),
            });

            return true;
        } catch (err) {
            console.error("❌ Greška pri postavljanju push notifikacija:", err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [userId, isSupported, sessionToken]);

    const disableNotifications = useCallback(async () => {
        if (!userId || !sessionToken) return;

        setLoading(true);
        try {
            const messaging = getFirebaseMessaging();
            if (!messaging) return;

            const token = await getToken(messaging, { vapidKey: VAPID_KEY });
            if (token) {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/push/delete-token`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${sessionToken}`
                    },
                    body: JSON.stringify({ token }),
                });
            }

            // Note: We can't programmatically revoke browser permission
            // but we can stop sending notifications from the server.
            setPermission("default"); // Optimistically set to default for UI
            return true;
        } catch (err) {
            console.error("❌ Greška pri isključivanju push notifikacija:", err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [userId, sessionToken]);

    useEffect(() => {
        if (!userId || initialized.current || !isSupported || !sessionToken) return;
        if (Notification.permission !== "granted") return;

        initialized.current = true;
        let handleSWMessage: ((event: MessageEvent) => void) | null = null;

        async function setup() {
            try {
                // Automatski dohvati i sačuvaj FCM token
                const registration = await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js")
                    || await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });

                const messaging = getFirebaseMessaging();
                if (!messaging) return;

                const token = await getToken(messaging, {
                    vapidKey: VAPID_KEY,
                    serviceWorkerRegistration: registration,
                });

                if (token) {
                    console.log("📲 Automatska registracija FCM tokena:", token.slice(0, 20) + "...");
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/push/save-token`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${sessionToken}`
                        },
                        body: JSON.stringify({ token }),
                    });
                }

                onMessage(messaging, (payload) => {
                    console.log("📩 Foreground poruka primljena:", payload);
                    window.dispatchEvent(new Event("unreadUpdate"));
                });

                // Osluškivanje poruka iz Service Workera (za slučaj kada native push listener presretne foreground poruku)
                handleSWMessage = (event: MessageEvent) => {
                    if (event.data && event.data.type === "FCM_FOREGROUND_EVENT") {
                        console.log("📩 Foreground poruka presretnuta iz SW:", event.data.payload);
                        window.dispatchEvent(new Event("unreadUpdate"));
                    }
                };
                navigator.serviceWorker.addEventListener("message", handleSWMessage);

            } catch (err) {
                console.error("❌ Greška u push background osluškivaču:", err);
            }
        }

        setup();

        return () => {
            if (handleSWMessage) {
                navigator.serviceWorker.removeEventListener("message", handleSWMessage);
            }
        };
    }, [userId, isSupported, sessionToken]);

    return {
        permission,
        isSupported,
        loading,
        enableNotifications,
        disableNotifications
    };
}
