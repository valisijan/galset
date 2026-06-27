"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const push_helpers_1 = require("../lib/push-helpers");
const notification_helpers_1 = require("../lib/notification-helpers");
const auth_1 = require("../middleware/auth");
const supabase_1 = require("../lib/supabase");
const router = (0, express_1.Router)();
// POST /messages/send - Slanje poruke
router.post('/send', async (req, res) => {
    try {
        const { senderId, receiverId, adId, content, conversationId: providedId, replyToId, replyToContent } = req.body;
        if (!senderId || !receiverId || !content) {
            return res.status(400).json({ success: false });
        }
        const receiver = await db_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.id, Number(receiverId)),
            columns: { id: true, username: true, isDeactivated: true },
        });
        if (receiver?.isDeactivated) {
            const username = receiver.username || 'korisnik';
            return res.status(403).json({ success: false, deactivated: true, message: `Korisnik @${username} je deaktivirao nalog` });
        }
        let conversationId = providedId;
        if (!conversationId) {
            const user1Id = Math.min(Number(senderId), Number(receiverId));
            const user2Id = Math.max(Number(senderId), Number(receiverId));
            const adCondition = adId ? (0, drizzle_orm_1.eq)(schema_1.chats.adId, Number(adId)) : (0, drizzle_orm_1.isNull)(schema_1.chats.adId);
            const conversation = await db_1.db.query.chats.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.chats.user1Id, user1Id), (0, drizzle_orm_1.eq)(schema_1.chats.user2Id, user2Id), adCondition),
            });
            conversationId = conversation?.id;
        }
        if (!conversationId) {
            const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let newId = '';
            for (let i = 0; i < 28; i++) {
                if (i > 0 && i % 4 === 0)
                    newId += '-';
                newId += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            conversationId = newId;
            await db_1.db.insert(schema_1.chats).values({
                id: conversationId,
                user1Id: Math.min(Number(senderId), Number(receiverId)),
                user2Id: Math.max(Number(senderId), Number(receiverId)),
                adId: adId ? Number(adId) : null,
            });
        }
        const now = new Date();
        // Upis poruke u Postgres
        const [insertedMsg] = await db_1.db.insert(schema_1.messages).values({
            senderId: Number(senderId),
            receiverId: Number(receiverId),
            adId: adId ? Number(adId) : null,
            content,
            conversationId: conversationId,
            replyToId: replyToId ? Number(replyToId) : null,
            replyToContent: replyToContent || null,
            createdAt: now,
        }).returning();
        await db_1.db.update(schema_1.chats).set({ updatedAt: now }).where((0, drizzle_orm_1.eq)(schema_1.chats.id, conversationId));
        const [senderUser, receiverUser, adData, conversationData] = await Promise.all([
            db_1.db.query.users.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.users.id, Number(senderId)) }),
            db_1.db.query.users.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.users.id, Number(receiverId)) }),
            adId ? db_1.db.query.ads.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ads.id, Number(adId)) }) : Promise.resolve(null),
            db_1.db.query.chats.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.chats.id, conversationId) }),
        ]);
        const fullMessage = {
            ...insertedMsg,
            id: insertedMsg.id.toString(), // Konvertujemo u string za klijentsku kompatibilnost
            sender: senderUser,
            receiver: receiverUser,
            ad: adData,
            conversation: conversationData
        };
        const senderName = senderUser?.fullName || senderUser?.username || 'Neko';
        // Broadcast nova poruka svim slušaocima konverzacije u realnom vremenu
        // Koristimo Supabase Realtime REST broadcast API — radi bez WebSocket subscribe,
        // idealno za server-side handlere. Ne zavisi od RLS politika ni case-senzitivnosti kolona.
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (supabaseUrl && supabaseKey) {
            fetch(`${supabaseUrl}/realtime/v1/api/broadcast`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [{
                            topic: `chat:${conversationId}`,
                            event: 'newMessage',
                            payload: fullMessage,
                        }]
                }),
            })
                .then((r) => { if (!r.ok)
                r.text().then(t => console.error('Broadcast error response:', r.status, t)); })
                .catch((err) => console.error('Broadcast REST error:', err));
        }
        // Push notifikacija
        _sendPushForMessages(receiverId, senderId, senderName, conversationId)
            .catch(err => console.error('Push error:', err));
        return res.json({ success: true, message: fullMessage });
    }
    catch (err) {
        console.error('❌ send message error:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});
async function _sendPushForMessages(receiverId, senderId, senderName, conversationId) {
    try {
        const unreadMessages = await db_1.db.select().from(schema_1.messages).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.messages.receiverId, Number(receiverId)), (0, drizzle_orm_1.eq)(schema_1.messages.senderId, Number(senderId)), (0, drizzle_orm_1.isNull)(schema_1.messages.readAt))).orderBy(schema_1.messages.createdAt);
        if (unreadMessages.length === 0)
            return;
        // Dobavi chat i oglas da bismo mogli izvući naslov oglasa
        const chat = await db_1.db.query.chats.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.chats.id, conversationId),
            with: {
                ad: { columns: { title: true } }
            }
        });
        const adTitle = chat?.ad?.title;
        const title = adTitle
            ? `Nova poruka za oglas ${adTitle}`
            : `Nova poruka od korisnika ${senderName}`;
        const combinedBody = unreadMessages.map((m) => {
            if (m.content && m.content.startsWith('[AUDIO:')) {
                return 'Glasovna poruka';
            }
            return m.content;
        }).join('\n');
        const truncatedBody = combinedBody.length > 200 ? combinedBody.slice(0, 197) + '...' : combinedBody;
        await (0, push_helpers_1.sendPushToUser)({
            userId: Number(receiverId),
            title,
            body: truncatedBody,
            data: {
                link: `/inbox/${conversationId}`,
                tag: `msg-${conversationId}`,
            },
            type: 'messages',
        });
    }
    catch (e) {
        console.error('Push send error:', e);
    }
}
// GET /messages/unread - Broj nepročitanih poruka
router.get('/unread', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const [result] = await db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.messages).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.messages.receiverId, userId), (0, drizzle_orm_1.isNull)(schema_1.messages.readAt)));
        return res.json({ success: true, count: Number(result?.count || 0) });
    }
    catch (err) {
        console.error('Fetch unread count error:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});
// GET /messages/conversations - Lista svih chat konverzacija
router.get('/conversations', auth_1.requireAuth, async (req, res) => {
    try {
        const uid = req.user.id;
        const userConvs = await db_1.db.query.chats.findMany({
            where: (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.chats.user1Id, uid), (0, drizzle_orm_1.eq)(schema_1.chats.user2Id, uid)),
            with: {
                user1: { columns: { id: true, username: true, fullName: true, profileImg: true, isDeactivated: true } },
                user2: { columns: { id: true, username: true, fullName: true, profileImg: true, isDeactivated: true } },
                ad: {
                    columns: { id: true, title: true, price: true, currency: true, city: true, images: true, createdAt: true, isPriceOnRequest: true, isReserved: true, category: true, userId: true, attributes: true },
                    with: {
                        promotions: {
                            where: (adPromotions, { gt }) => gt(adPromotions.expiresAt, new Date())
                        }
                    }
                }
            }
        });
        const mappedConvs = [];
        for (const conv of userConvs) {
            const otherUser = conv.user1Id === uid ? conv.user2 : conv.user1;
            const lastMsg = await db_1.db.query.messages.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.messages.conversationId, conv.id),
                orderBy: [(0, drizzle_orm_1.desc)(schema_1.messages.createdAt)]
            });
            if (!lastMsg)
                continue;
            const [unreadResult] = await db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.messages).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.messages.conversationId, conv.id), (0, drizzle_orm_1.eq)(schema_1.messages.receiverId, uid), (0, drizzle_orm_1.isNull)(schema_1.messages.readAt)));
            const unreadCount = Number(unreadResult?.count || 0);
            mappedConvs.push({
                id: conv.id,
                otherUser,
                ad: conv.ad,
                lastMessage: lastMsg.content,
                lastMessageSenderId: lastMsg.senderId,
                time: lastMsg.createdAt,
                unread: unreadCount > 0,
                unreadCount: unreadCount,
            });
        }
        mappedConvs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        return res.json({ success: true, conversations: mappedConvs });
    }
    catch (err) {
        console.error('Fetch conversations error:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});
// POST /messages/init - Inicijalizacija konverzacije
router.post('/init', auth_1.requireAuth, async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId, adId } = req.body;
        if (!receiverId) {
            return res.status(400).json({ success: false, error: 'Receiver ID is required' });
        }
        if (senderId === Number(receiverId)) {
            return res.status(400).json({ success: false, error: 'Cannot message yourself' });
        }
        const user1Id = Math.min(senderId, Number(receiverId));
        const user2Id = Math.max(senderId, Number(receiverId));
        const adCondition = adId ? (0, drizzle_orm_1.eq)(schema_1.chats.adId, Number(adId)) : (0, drizzle_orm_1.isNull)(schema_1.chats.adId);
        let conversation = await db_1.db.query.chats.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.chats.user1Id, user1Id), (0, drizzle_orm_1.eq)(schema_1.chats.user2Id, user2Id), adCondition),
        });
        let conversationId = conversation?.id;
        if (!conversationId) {
            const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let newId = '';
            for (let i = 0; i < 28; i++) {
                if (i > 0 && i % 4 === 0)
                    newId += '-';
                newId += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            conversationId = newId;
            await db_1.db.insert(schema_1.chats).values({
                id: conversationId,
                user1Id,
                user2Id,
                adId: adId ? Number(adId) : null,
            });
        }
        return res.json({ success: true, conversationId });
    }
    catch (err) {
        console.error('❌ init conversation error:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});
// GET /messages/history - Istorija poruka za konverzaciju
router.get('/history', auth_1.requireAuth, async (req, res) => {
    try {
        const { conversationId, cursor } = req.query;
        if (!conversationId) {
            return res.status(400).json({ success: false, error: 'Conversation ID required' });
        }
        const conversation = await db_1.db.query.chats.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.chats.id, conversationId),
            with: {
                user1: { columns: { id: true, username: true, fullName: true, profileImg: true, isDeactivated: true } },
                user2: { columns: { id: true, username: true, fullName: true, profileImg: true, isDeactivated: true } },
                ad: {
                    columns: { id: true, title: true, price: true, currency: true, city: true, images: true, createdAt: true, isPriceOnRequest: true, isReserved: true, category: true, userId: true, attributes: true },
                    with: {
                        promotions: {
                            where: (adPromotions, { gt }) => gt(adPromotions.expiresAt, new Date())
                        }
                    }
                }
            }
        });
        if (!conversation || (conversation.user1Id !== req.user.id && conversation.user2Id !== req.user.id)) {
            return res.status(404).json({ success: false, error: 'Conversation not found' });
        }
        const limit = parseInt(req.query.limit) || 20;
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.messages.conversationId, conversationId)];
        if (cursor) {
            const cursorNum = parseInt(cursor);
            if (!isNaN(cursorNum)) {
                conditions.push((0, drizzle_orm_1.lt)(schema_1.messages.id, cursorNum));
            }
        }
        const rawMessages = await db_1.db.select().from(schema_1.messages)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.messages.createdAt))
            .limit(limit);
        // Pretvaramo ID u string radi kompatibilnosti sa frontendom
        const formattedMessages = rawMessages.map((m) => ({
            ...m,
            id: m.id.toString(),
            replyToId: m.replyToId ? m.replyToId.toString() : null
        })).reverse();
        return res.json({
            success: true,
            messages: formattedMessages,
            conversation
        });
    }
    catch (err) {
        console.error('Fetch messages history error:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});
// POST /messages/read - Označi poruke kao pročitane
router.post('/read', auth_1.requireAuth, async (req, res) => {
    try {
        const { messageIds } = req.body;
        if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
            return res.json({ success: true });
        }
        const numericIds = messageIds.map(id => parseInt(id)).filter(id => !isNaN(id));
        if (numericIds.length > 0) {
            const now = new Date();
            await db_1.db.update(schema_1.messages)
                .set({ readAt: now })
                .where((0, drizzle_orm_1.inArray)(schema_1.messages.id, numericIds));
            // Pronađi konverzaciju iz prve poruke da bismo znali na koji topic da pošaljemo broadcast
            const firstMsg = await db_1.db.query.messages.findFirst({
                where: (0, drizzle_orm_1.inArray)(schema_1.messages.id, numericIds),
                columns: { conversationId: true }
            });
            if (firstMsg?.conversationId) {
                const supabaseUrl = process.env.SUPABASE_URL;
                const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
                if (supabaseUrl && supabaseKey) {
                    fetch(`${supabaseUrl}/realtime/v1/api/broadcast`, {
                        method: 'POST',
                        headers: {
                            'apikey': supabaseKey,
                            'Authorization': `Bearer ${supabaseKey}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            messages: [{
                                    topic: `chat:${firstMsg.conversationId}`,
                                    event: 'messagesRead',
                                    payload: {
                                        messageIds: numericIds.map(id => id.toString()),
                                        readAt: now.toISOString(),
                                    },
                                }]
                        }),
                    }).catch(err => console.error('Broadcast messagesRead error:', err));
                }
            }
        }
        return res.json({ success: true });
    }
    catch (err) {
        console.error('Read messages error:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});
// POST /messages/like - Sviđa mi se/ukloni sviđanje sa poruke
router.post('/like', auth_1.requireAuth, async (req, res) => {
    try {
        const { messageId } = req.body;
        if (!messageId) {
            return res.status(400).json({ success: false, error: 'Message ID required' });
        }
        const msgIdNum = parseInt(messageId);
        if (isNaN(msgIdNum))
            return res.status(400).json({ success: false, error: 'Invalid Message ID' });
        const msg = await db_1.db.query.messages.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.messages.id, msgIdNum) });
        if (!msg) {
            return res.status(404).json({ success: false, error: 'Message not found' });
        }
        const newLikedAt = msg.likedAt ? null : new Date();
        await db_1.db.update(schema_1.messages)
            .set({ likedAt: newLikedAt })
            .where((0, drizzle_orm_1.eq)(schema_1.messages.id, msgIdNum));
        if (newLikedAt && Number(msg.senderId) !== Number(req.user.id)) {
            const body = msg.content.startsWith('[AUDIO:') ? 'Glasovna poruka' : msg.content;
            (0, notification_helpers_1.createNotification)({
                userId: Number(msg.senderId),
                type: 'MESSAGE_REACTION',
                title: 'Reakcija na poruku',
                body,
                senderId: req.user.id,
                actionUrl: `/inbox/${msg.conversationId}`,
                sendPush: true
            }).catch(err => console.error('Error creating reaction notification:', err));
        }
        return res.json({ success: true });
    }
    catch (err) {
        console.error('Like message error:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});
// GET /messages/link-preview - Dobijanje metapodataka za link preview
router.get('/link-preview', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url || typeof url !== 'string') {
            return res.status(400).json({ success: false, error: 'URL is required' });
        }
        let targetUrl = url;
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = 'https://' + targetUrl;
        }
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), 5000);
        try {
            const response = await fetch(targetUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'sr,en-US;q=0.7,en;q=0.3',
                },
                signal: abortController.signal
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                return res.json({ success: true, title: new URL(targetUrl).hostname, image: '', url: targetUrl });
            }
            const html = await response.text();
            // Ekstrakcija naslova
            let title = '';
            const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
                html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
            if (ogTitleMatch) {
                title = ogTitleMatch[1];
            }
            else {
                const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
                if (titleMatch) {
                    title = titleMatch[1];
                }
            }
            // Ekstrakcija slike/logoa
            let image = '';
            const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
            if (ogImageMatch) {
                image = ogImageMatch[1];
            }
            else {
                const iconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i) ||
                    html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i);
                if (iconMatch) {
                    let iconUrl = iconMatch[1];
                    if (iconUrl.startsWith('//')) {
                        iconUrl = 'https:' + iconUrl;
                    }
                    else if (iconUrl.startsWith('/')) {
                        const parsedUrl = new URL(targetUrl);
                        iconUrl = parsedUrl.origin + iconUrl;
                    }
                    else if (!iconUrl.startsWith('http://') && !iconUrl.startsWith('https://')) {
                        const parsedUrl = new URL(targetUrl);
                        iconUrl = parsedUrl.origin + '/' + iconUrl;
                    }
                    image = iconUrl;
                }
            }
            if (title) {
                title = title
                    .replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .trim();
            }
            return res.json({
                success: true,
                title: title || new URL(targetUrl).hostname,
                image: image || '',
                url: targetUrl
            });
        }
        catch (e) {
            clearTimeout(timeoutId);
            console.error('Fetch error during link preview:', e.message);
            return res.json({
                success: true,
                title: new URL(targetUrl).hostname,
                image: '',
                url: targetUrl
            });
        }
    }
    catch (err) {
        console.error('Link preview endpoint error:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});
// PATCH /messages/edit - Izmena poruke
router.patch('/edit', auth_1.requireAuth, async (req, res) => {
    try {
        const { messageId, content } = req.body;
        const userId = req.user.id;
        if (!messageId || !content) {
            return res.status(400).json({ success: false, error: 'Message ID and content are required' });
        }
        const msgIdNum = parseInt(messageId);
        if (isNaN(msgIdNum)) {
            return res.status(400).json({ success: false, error: 'Invalid Message ID' });
        }
        const msg = await db_1.db.query.messages.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.messages.id, msgIdNum) });
        if (!msg) {
            return res.status(404).json({ success: false, error: 'Message not found' });
        }
        if (Number(msg.senderId) !== Number(userId)) {
            return res.status(403).json({ success: false, error: 'Unauthorized to edit this message' });
        }
        // Provera vremenskog ograničenja od 10 minuta
        const timeDiff = Date.now() - new Date(msg.createdAt).getTime();
        if (timeDiff > 10 * 60 * 1000) {
            return res.status(400).json({ success: false, error: 'Time limit for editing (10 minutes) exceeded' });
        }
        const now = new Date();
        await db_1.db.update(schema_1.messages)
            .set({ content, editedAt: now })
            .where((0, drizzle_orm_1.eq)(schema_1.messages.id, msgIdNum));
        // Broadcast izmene
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (supabaseUrl && supabaseKey) {
            fetch(`${supabaseUrl}/realtime/v1/api/broadcast`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [{
                            topic: `chat:${msg.conversationId}`,
                            event: 'messageEdited',
                            payload: { id: messageId, content, editedAt: now.toISOString() },
                        }]
                }),
            }).catch(err => console.error('Broadcast messageEdited error:', err));
        }
        return res.json({ success: true, editedAt: now.toISOString() });
    }
    catch (err) {
        console.error('Edit message error:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});
// DELETE /messages/delete/:id - Brisanje poruke
router.delete('/delete/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const messageId = req.params.id;
        const userId = req.user.id;
        if (!messageId) {
            return res.status(400).json({ success: false, error: 'Message ID is required' });
        }
        const msgIdNum = parseInt(messageId);
        if (isNaN(msgIdNum)) {
            return res.status(400).json({ success: false, error: 'Invalid Message ID' });
        }
        const msg = await db_1.db.query.messages.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.messages.id, msgIdNum) });
        if (!msg) {
            return res.status(404).json({ success: false, error: 'Message not found' });
        }
        if (Number(msg.senderId) !== Number(userId)) {
            return res.status(403).json({ success: false, error: 'Unauthorized to delete this message' });
        }
        // Provera vremenskog ograničenja od 10 minuta
        const timeDiff = Date.now() - new Date(msg.createdAt).getTime();
        if (timeDiff > 10 * 60 * 1000) {
            return res.status(400).json({ success: false, error: 'Time limit for deleting (10 minutes) exceeded' });
        }
        // Ako je glasovna poruka, obriši fajl iz Supabase Storage bucket-a 'audios'
        if (msg.content && msg.content.startsWith('[AUDIO:') && msg.content.endsWith(']')) {
            try {
                const inside = msg.content.slice(7, -1);
                const parts = inside.split('|');
                const audioUrl = parts[0];
                // Ekstrakcija imena fajla iz URL-a
                const fileName = audioUrl.split('/').pop()?.split('?')[0];
                if (fileName) {
                    const { error: storageError } = await supabase_1.supabase.storage
                        .from('audios')
                        .remove([fileName]);
                    if (storageError) {
                        console.error(`[DeleteMessage] Error removing file ${fileName} from Supabase:`, storageError);
                    }
                    else {
                        console.log(`[DeleteMessage] Successfully removed file ${fileName} from Supabase storage`);
                    }
                }
            }
            catch (storageErr) {
                console.error('[DeleteMessage] Storage deletion error:', storageErr);
            }
        }
        await db_1.db.delete(schema_1.messages).where((0, drizzle_orm_1.eq)(schema_1.messages.id, msgIdNum));
        // Broadcast brisanja
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (supabaseUrl && supabaseKey) {
            fetch(`${supabaseUrl}/realtime/v1/api/broadcast`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [{
                            topic: `chat:${msg.conversationId}`,
                            event: 'messageDeleted',
                            payload: { id: messageId },
                        }]
                }),
            }).catch(err => console.error('Broadcast messageDeleted error:', err));
        }
        return res.json({ success: true });
    }
    catch (err) {
        console.error('Delete message error:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});
exports.default = router;
