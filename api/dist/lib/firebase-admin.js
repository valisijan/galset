"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = void 0;
exports.sendPushNotification = sendPushNotification;
const admin = __importStar(require("firebase-admin"));
exports.admin = admin;
if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    if (!projectId || !clientEmail || !privateKey) {
        console.warn('⚠️ Firebase Admin: Nedostaju env varijable (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)');
    }
    else {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
    }
}
async function sendPushNotification({ token, title, body, data, }) {
    try {
        if (!admin.apps.length) {
            console.warn('⚠️ Firebase Admin nije inicijalizovan - push notifikacija nije poslana');
            return false;
        }
        const pushData = {
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
    }
    catch (err) {
        if (err?.code === 'messaging/registration-token-not-registered' ||
            err?.code === 'messaging/invalid-registration-token') {
            return false;
        }
        console.error('❌ Greška pri slanju push notifikacije:', err);
        return false;
    }
}
