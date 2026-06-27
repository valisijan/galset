"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = createNotification;
const db_1 = require("./db");
const schema_1 = require("./db/schema");
const push_helpers_1 = require("./push-helpers");
async function createNotification(params) {
    const { userId, type, title, body, imageUrl, actionUrl, senderId, adId, sendPush = true, } = params;
    try {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 365);
        await db_1.db.insert(schema_1.notifications).values({
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
            const pushData = {
                link: actionUrl || '/notifications',
            };
            if (imageUrl && type !== 'USER_FOLLOW' && type !== 'AD_WISHLIST') {
                pushData.icon = imageUrl.split("|||")[0];
            }
            let prefType;
            if (type === 'AD_WISHLIST')
                prefType = 'followedAds';
            else if (type === 'MESSAGE_REACTION')
                prefType = 'messages';
            else if (type === 'USER_FOLLOW')
                prefType = 'newFollowers';
            else if (type === 'AD_EXPIRED')
                prefType = 'expiredAds';
            else if (type === 'NEW_REVIEW')
                prefType = 'newReviews';
            else if (type === 'PROMOTION_EXPIRED')
                prefType = 'expiredPromotions';
            (0, push_helpers_1.sendPushToUser)({
                userId,
                title,
                body,
                data: pushData,
                type: prefType,
            }).catch(err => console.error('❌ Push send failed:', err));
        }
    }
    catch (err) {
        console.error('❌ Failed to create notification:', err);
    }
}
