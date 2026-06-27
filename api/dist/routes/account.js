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
// @ts-nocheck
const express_1 = require("express");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const supabase_1 = require("../lib/supabase");
const router = (0, express_1.Router)();
// GET /account
router.get('/', auth_1.requireAuth, async (req, res) => {
    const userId = req.user.id;
    const user = await db_1.db.query.users.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_1.users.id, userId),
        columns: { id: true, fullName: true, username: true, email: true, country: true, city: true, address: true, phone: true, birthDate: true, profileImg: true, description: true },
    });
    return res.json({ user });
});
// PUT /account
router.put('/', auth_1.requireAuth, async (req, res) => {
    const userId = req.user.id;
    const body = req.body;
    const allowedFields = ['fullName', 'username', 'email', 'country', 'city', 'address', 'phone', 'birthDate', 'profileImg', 'description'];
    const data = {};
    if (body.email) {
        const existing = await db_1.db.query.users.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.users.email, body.email) });
        if (existing && existing.id !== userId) {
            return res.status(400).json({ error: 'Email adresa je već u upotrebi' });
        }
    }
    for (const field of allowedFields) {
        if (body[field] !== undefined) {
            if (field === 'birthDate') {
                const date = new Date(body[field]);
                if (!isNaN(date.getTime()))
                    data.birthDate = date;
            }
            else {
                data[field] = body[field] !== undefined ? body[field] : null;
            }
        }
    }
    if (Object.keys(data).length === 0) {
        return res.status(400).json({ error: 'Nema podataka za izmenu' });
    }
    if (data.profileImg !== undefined) {
        const { originalTempImageId, cropTempImageId } = body;
        await db_1.db.update(schema_1.tempImages).set({ isPublished: false }).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tempImages.userId, userId), (0, drizzle_orm_1.eq)(schema_1.tempImages.isPublished, true), (0, drizzle_orm_1.inArray)(schema_1.tempImages.imageType, ['profile_original', 'profile_crop'])));
        const newIds = [];
        if (originalTempImageId)
            newIds.push(originalTempImageId);
        if (cropTempImageId)
            newIds.push(cropTempImageId);
        if (newIds.length > 0) {
            await db_1.db.update(schema_1.tempImages).set({ isPublished: true }).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tempImages.userId, userId), (0, drizzle_orm_1.inArray)(schema_1.tempImages.id, newIds)));
        }
    }
    const [updatedUser] = await db_1.db.update(schema_1.users).set(data).where((0, drizzle_orm_1.eq)(schema_1.users.id, userId)).returning({
        id: schema_1.users.id, fullName: schema_1.users.fullName, username: schema_1.users.username, email: schema_1.users.email,
        country: schema_1.users.country, city: schema_1.users.city, address: schema_1.users.address, phone: schema_1.users.phone,
        birthDate: schema_1.users.birthDate, profileImg: schema_1.users.profileImg, description: schema_1.users.description,
    });
    return res.json({ success: true, user: updatedUser });
});
// DELETE /account
router.delete('/', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await db_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.id, userId),
            columns: { supabaseId: true }
        });
        if (user?.supabaseId) {
            // Delete user from Supabase auth using admin client
            const { error: sbDeleteError } = await supabase_1.supabase.auth.admin.deleteUser(user.supabaseId);
            if (sbDeleteError) {
                console.error('[delete-account] Supabase Auth deletion error:', sbDeleteError.message);
            }
            // Delete all user sessions
            await db_1.db.execute((0, drizzle_orm_1.sql) `DELETE FROM auth.sessions WHERE user_id = ${user.supabaseId}::uuid`);
        }
        // 1. Find or create the special "Obrisan korisnik" user
        let deletedUser = await db_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.username, 'obrisan_korisnik')
        });
        if (!deletedUser) {
            const [newDeletedUser] = await db_1.db.insert(schema_1.users).values({
                email: 'obrisan@galset.com',
                username: 'obrisan_korisnik',
                fullName: 'Obrisan korisnik',
            }).returning();
            deletedUser = newDeletedUser;
        }
        const specialUserId = deletedUser.id;
        // 2. Re-assign user's Chat, Message, and Review to "Obrisan korisnik"
        const { chats, messages, reviews } = await Promise.resolve().then(() => __importStar(require('../lib/db/schema')));
        // Update chats
        await db_1.db.update(chats).set({ user1Id: specialUserId }).where((0, drizzle_orm_1.eq)(chats.user1Id, userId));
        await db_1.db.update(chats).set({ user2Id: specialUserId }).where((0, drizzle_orm_1.eq)(chats.user2Id, userId));
        // Update messages
        await db_1.db.update(messages).set({ senderId: specialUserId }).where((0, drizzle_orm_1.eq)(messages.senderId, userId));
        await db_1.db.update(messages).set({ receiverId: specialUserId }).where((0, drizzle_orm_1.eq)(messages.receiverId, userId));
        // Update reviews
        await db_1.db.update(reviews).set({ reviewerId: specialUserId }).where((0, drizzle_orm_1.eq)(reviews.reviewerId, userId));
        await db_1.db.update(reviews).set({ userId: specialUserId }).where((0, drizzle_orm_1.eq)(reviews.userId, userId));
        // 3. Delete the user from users table (cascading deletes will handle ads, wishlists, wallet, transaction, aichats, aimessages, etc.)
        await db_1.db.delete(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
        return res.json({ success: true });
    }
    catch (err) {
        console.error('[delete-account] Error:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});
// POST /account/deactivate
router.post('/deactivate', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        // Set isDeactivated to true
        await db_1.db.update(schema_1.users).set({ isDeactivated: true }).where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
        // Hide all user's ads
        await db_1.db.update(schema_1.ads).set({ status: 'DEACTIVATED' }).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.ads.userId, userId), (0, drizzle_orm_1.eq)(schema_1.ads.status, 'ACTIVE')));
        // Delete all sessions to force sign-out
        const user = await db_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.id, userId),
            columns: { supabaseId: true }
        });
        if (user?.supabaseId) {
            await db_1.db.execute((0, drizzle_orm_1.sql) `DELETE FROM auth.sessions WHERE user_id = ${user.supabaseId}::uuid`);
        }
        return res.json({ success: true });
    }
    catch (err) {
        console.error('[deactivate-account] Error:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});
// GET /account/notification-preferences
router.get('/notification-preferences', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        let prefs = await db_1.db.query.notificationPreferences.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.notificationPreferences.userId, userId)
        });
        if (!prefs) {
            const [newPrefs] = await db_1.db.insert(schema_1.notificationPreferences).values({
                userId,
            }).returning();
            prefs = newPrefs;
        }
        return res.json({ success: true, preferences: prefs });
    }
    catch (err) {
        console.error('Error fetching notification preferences:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});
// PATCH /account/notification-preferences
router.patch('/notification-preferences', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { messages, expiredAds, expiredPromotions, followedAds, newFollowers, newReviews } = req.body;
        const updateData = {
            updatedAt: new Date(),
        };
        if (messages !== undefined)
            updateData.messages = !!messages;
        if (expiredAds !== undefined)
            updateData.expiredAds = !!expiredAds;
        if (expiredPromotions !== undefined)
            updateData.expiredPromotions = !!expiredPromotions;
        if (followedAds !== undefined)
            updateData.followedAds = !!followedAds;
        if (newFollowers !== undefined)
            updateData.newFollowers = !!newFollowers;
        if (newReviews !== undefined)
            updateData.newReviews = !!newReviews;
        // Check if preferences exist first, if not create default, otherwise update
        let prefs = await db_1.db.query.notificationPreferences.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.notificationPreferences.userId, userId)
        });
        let result;
        if (!prefs) {
            const [newPrefs] = await db_1.db.insert(schema_1.notificationPreferences).values({
                userId,
                ...updateData
            }).returning();
            result = newPrefs;
        }
        else {
            const [updated] = await db_1.db.update(schema_1.notificationPreferences)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.notificationPreferences.userId, userId))
                .returning();
            result = updated;
        }
        return res.json({ success: true, preferences: result });
    }
    catch (err) {
        console.error('Error updating notification preferences:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});
exports.default = router;
