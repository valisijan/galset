"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const AIController_1 = require("../lib/ai/AIController");
const crypto_1 = __importDefault(require("crypto"));
const router = (0, express_1.Router)();
// GET /ai/chat/limit-status - Provera dnevnog limita za ulogovanog korisnika
router.get('/chat/limit-status', auth_1.optionalAuth, async (req, res) => {
    try {
        if (!req.user) {
            return res.json({ success: true, isLoggedIn: false });
        }
        const userId = req.user.id;
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const userMessages = await db_1.db.select({
            id: schema_1.aiMessages.id,
            createdAt: schema_1.aiMessages.createdAt
        })
            .from(schema_1.aiMessages)
            .innerJoin(schema_1.aiChats, (0, drizzle_orm_1.eq)(schema_1.aiMessages.sessionId, schema_1.aiChats.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.aiChats.userId, userId), (0, drizzle_orm_1.eq)(schema_1.aiMessages.role, 'user'), (0, drizzle_orm_1.gte)(schema_1.aiMessages.createdAt, oneDayAgo)))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.aiMessages.createdAt));
        const limit = 30;
        const count = userMessages.length;
        const limitReached = count >= limit;
        let resetTime = null;
        if (count > 0) {
            resetTime = new Date(userMessages[0].createdAt.getTime() + 24 * 60 * 60 * 1000);
        }
        return res.json({
            success: true,
            isLoggedIn: true,
            count,
            limit,
            limitReached,
            resetTime: resetTime ? resetTime.toISOString() : null
        });
    }
    catch (error) {
        console.error('Check AI limit error:', error);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});
// GET /ai/chat/sessions - Sve AI sesije korisnika
router.get('/chat/sessions', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const sessions = await db_1.db.select().from(schema_1.aiChats)
            .where((0, drizzle_orm_1.eq)(schema_1.aiChats.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.aiChats.updatedAt));
        return res.json({ success: true, sessions });
    }
    catch (error) {
        console.error('Fetch AI sessions error:', error);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});
// GET /ai/chat/sessions/:id - Poruke unutar jedne AI sesije
router.get('/chat/sessions/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { cursor } = req.query;
        const chatSession = await db_1.db.query.aiChats.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.aiChats.id, id), (0, drizzle_orm_1.eq)(schema_1.aiChats.userId, userId))
        });
        if (!chatSession) {
            return res.status(404).json({ success: false, error: 'Conversation not found' });
        }
        const limit = 20;
        // Filtriranje poruka
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.aiMessages.sessionId, id)];
        if (cursor) {
            const cursorNum = parseInt(cursor);
            if (!isNaN(cursorNum)) {
                conditions.push((0, drizzle_orm_1.lt)(schema_1.aiMessages.id, cursorNum));
            }
        }
        const messages = await db_1.db.select().from(schema_1.aiMessages)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.aiMessages.id))
            .limit(limit + 1);
        const hasMore = messages.length > limit;
        if (hasMore) {
            messages.pop(); // Uklanjamo ekstra element koji služi za proveru "hasMore"
        }
        // Formatiranje poruka za ai/react klijent (reverse da budu hronološke)
        const formattedMessages = messages.map(m => ({
            id: m.id.toString(),
            role: m.role,
            content: m.content || '',
            toolInvocations: m.toolCalls || undefined,
            thumbUp: m.thumbUp ?? false,
            thumbDown: m.thumbDown ?? false,
            createdAt: m.createdAt
        })).reverse();
        return res.json({
            success: true,
            messages: formattedMessages,
            hasMore
        });
    }
    catch (error) {
        console.error('Fetch AI messages error:', error);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});
// DELETE /ai/chat/sessions/:id - Brisanje AI sesije
router.delete('/chat/sessions/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        // Brisanje sesije (cascade u Postgresu briše i poruke iz AiMessage)
        const result = await db_1.db.delete(schema_1.aiChats)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.aiChats.id, id), (0, drizzle_orm_1.eq)(schema_1.aiChats.userId, userId)))
            .returning();
        if (result.length === 0) {
            return res.status(404).json({ success: false, error: 'Conversation not found' });
        }
        return res.json({ success: true });
    }
    catch (error) {
        console.error('Delete AI session error:', error);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});
// PATCH /ai/chat/sessions/:id - Preimenovanje AI sesije
router.patch('/chat/sessions/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { title } = req.body;
        if (!title || typeof title !== 'string' || !title.trim()) {
            return res.status(400).json({ success: false, error: 'Naziv je obavezan' });
        }
        const result = await db_1.db.update(schema_1.aiChats)
            .set({ title: title.trim(), updatedAt: new Date() })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.aiChats.id, id), (0, drizzle_orm_1.eq)(schema_1.aiChats.userId, userId)))
            .returning();
        if (result.length === 0) {
            return res.status(404).json({ success: false, error: 'Conversation not found' });
        }
        return res.json({ success: true, session: result[0] });
    }
    catch (error) {
        console.error('Rename AI session error:', error);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});
// POST /ai/chat - Slanje poruke i streamovanje odgovora
router.post('/chat', auth_1.optionalAuth, async (req, res) => {
    try {
        const { messages, id: clientChatId, isPrivate } = req.body;
        let userId = req.user?.id ?? null;
        if (isPrivate) {
            userId = null;
        }
        let sessionId = clientChatId;
        const latestUserMsg = messages[messages.length - 1];
        if (userId) {
            // Provera dnevnog limita (30 poruka u 24h)
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const userMessages = await db_1.db.select({
                id: schema_1.aiMessages.id
            })
                .from(schema_1.aiMessages)
                .innerJoin(schema_1.aiChats, (0, drizzle_orm_1.eq)(schema_1.aiMessages.sessionId, schema_1.aiChats.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.aiChats.userId, userId), (0, drizzle_orm_1.eq)(schema_1.aiMessages.role, 'user'), (0, drizzle_orm_1.gte)(schema_1.aiMessages.createdAt, oneDayAgo)));
            if (userMessages.length >= 30) {
                return res.status(429).json({ success: false, error: 'Dostigli ste dnevni limit' });
            }
            if (!sessionId || sessionId.length < 5) {
                sessionId = crypto_1.default.randomUUID();
            }
            const existingSession = await db_1.db.select().from(schema_1.aiChats).where((0, drizzle_orm_1.eq)(schema_1.aiChats.id, sessionId)).limit(1);
            if (existingSession.length === 0) {
                const title = latestUserMsg?.content ? latestUserMsg.content.substring(0, 30) + (latestUserMsg.content.length > 30 ? '...' : '') : 'Novi razgovor';
                await db_1.db.insert(schema_1.aiChats).values({ id: sessionId, userId, title });
            }
            else {
                if (existingSession[0].userId !== userId) {
                    return res.status(404).send('Conversation not found');
                }
                await db_1.db.update(schema_1.aiChats).set({ updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema_1.aiChats.id, sessionId));
            }
            if (latestUserMsg?.role === 'user') {
                try {
                    await db_1.db.insert(schema_1.aiMessages).values({
                        sessionId,
                        role: 'user',
                        content: latestUserMsg.content || '',
                        createdAt: new Date()
                    });
                }
                catch (dbErr) {
                    console.error('AI_CHAT_USER_MSG_SAVE_ERROR:', dbErr);
                }
            }
        }
        const aiController = new AIController_1.AIController();
        const streamResponse = await aiController.generateFinalStream(messages, async (fullText, toolInvocations) => {
            if (userId && sessionId) {
                try {
                    await db_1.db.insert(schema_1.aiMessages).values({
                        sessionId,
                        role: 'assistant',
                        content: fullText || '',
                        toolCalls: toolInvocations || null,
                        createdAt: new Date()
                    });
                }
                catch (dbError) {
                    console.error('AI_CHAT_POSTGRES_INSERT_ERROR:', dbError);
                }
            }
        });
        // Pipe the Web Response to Express response
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('X-Vercel-AI-Data-Stream', 'v1');
        const body = streamResponse.body;
        if (body) {
            const reader = body.getReader();
            const pump = async () => {
                const { done, value } = await reader.read();
                if (done) {
                    res.end();
                    return;
                }
                res.write(Buffer.from(value));
                await pump();
            };
            await pump();
        }
        else {
            res.end();
        }
    }
    catch (error) {
        console.error('AI_CHAT_ERROR:', error);
        let errMsg = 'Trenutno imamo problema sa AI serverom. Error: ' + (error.message || 'Unknown log');
        if (error.message?.includes('exhausted') || error.message?.includes('quota') || error.message?.includes('429')) {
            errMsg = 'Prevazišao si limit zahteva. Sačekaj malo pa pokušaj ponovo.';
        }
        const streamPayload = `0:${JSON.stringify(errMsg)}\n`;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('X-Vercel-AI-Data-Stream', 'v1');
        return res.status(200).send(streamPayload);
    }
});
// PATCH /ai/chat/messages/:id/feedback - Ažuriranje povratnih informacija za poruku
router.patch('/chat/messages/:id/feedback', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { thumbUp, thumbDown } = req.body;
        if (typeof thumbUp !== 'boolean' || typeof thumbDown !== 'boolean') {
            return res.status(400).json({ success: false, error: 'thumbUp i thumbDown moraju biti boolean vrednosti' });
        }
        const messageId = parseInt(id);
        if (isNaN(messageId)) {
            return res.status(400).json({ success: false, error: 'Nevalidan ID poruke' });
        }
        // Provera da li poruka pripada sesiji ovog korisnika
        const message = await db_1.db.query.aiMessages.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.aiMessages.id, messageId),
            with: {
                chat: true
            }
        });
        if (!message || !message.chat || message.chat.userId !== userId) {
            return res.status(404).json({ success: false, error: 'Poruka nije pronađena' });
        }
        const result = await db_1.db.update(schema_1.aiMessages)
            .set({ thumbUp, thumbDown })
            .where((0, drizzle_orm_1.eq)(schema_1.aiMessages.id, messageId))
            .returning();
        return res.json({ success: true, message: result[0] });
    }
    catch (error) {
        console.error('Update message feedback error:', error);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});
exports.default = router;
