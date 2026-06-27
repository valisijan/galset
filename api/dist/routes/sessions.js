"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const sessionHelper_1 = require("../lib/sessionHelper");
const router = (0, express_1.Router)();
const locationCache = new Map();
async function getCachedLocation(ip) {
    if (!ip || ip === '127.0.0.1')
        return 'Lokalni uređaj';
    if (locationCache.has(ip)) {
        return locationCache.get(ip);
    }
    try {
        const { location } = await (0, sessionHelper_1.resolveIpAndLocation)(ip);
        locationCache.set(ip, location);
        return location;
    }
    catch (err) {
        console.error('Failed resolving IP location:', err);
        return 'Nepoznata lokacija';
    }
}
// GET /sessions — sve aktivne sesije korisnika
router.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const currentSessionId = req.user?.sessionId;
        // Get the user's supabaseId
        const user = await db_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.id, userId),
            columns: { supabaseId: true }
        });
        if (!user?.supabaseId) {
            return res.json({ success: true, sessions: [] });
        }
        // Query sessions from Supabase's auth.sessions
        const result = await db_1.db.execute((0, drizzle_orm_1.sql) `
      SELECT id, created_at, user_agent, ip 
      FROM auth.sessions 
      WHERE user_id = ${user.supabaseId}::uuid
      ORDER BY created_at DESC;
    `);
        const rawSessions = result.rows;
        // Resolve details in parallel
        const userSessions = await Promise.all(rawSessions.map(async (s) => {
            const parsedUa = (0, sessionHelper_1.parseUserAgent)(s.user_agent || 'unknown');
            const resolvedLocation = await getCachedLocation(s.ip || '');
            return {
                id: s.id,
                userAgent: parsedUa.name,
                ipAddress: s.ip,
                deviceType: parsedUa.deviceType,
                location: resolvedLocation,
                createdAt: s.created_at,
                expires: null,
                isCurrent: currentSessionId ? s.id === currentSessionId : false,
            };
        }));
        return res.json({ success: true, sessions: userSessions });
    }
    catch (error) {
        console.error('Error fetching sessions:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
// DELETE /sessions/all — brisanje svih sesija korisnika (logout sa svih uređaja)
router.delete('/all', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        // Get the user's supabaseId
        const user = await db_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.id, userId),
            columns: { supabaseId: true }
        });
        if (!user?.supabaseId) {
            return res.json({ success: true });
        }
        await db_1.db.execute((0, drizzle_orm_1.sql) `
      DELETE FROM auth.sessions 
      WHERE user_id = ${user.supabaseId}::uuid;
    `);
        return res.json({ success: true });
    }
    catch (error) {
        console.error('Error deleting all sessions:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
// DELETE /sessions/:id — brisanje jedne sesije (force logout)
router.delete('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const sessionId = req.params.id;
        // Get the user's supabaseId to make sure they own the session
        const user = await db_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.id, userId),
            columns: { supabaseId: true }
        });
        if (!user?.supabaseId) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        // Check ownership of this session first
        const checkResult = await db_1.db.execute((0, drizzle_orm_1.sql) `
      SELECT user_id FROM auth.sessions WHERE id = ${sessionId}::uuid LIMIT 1;
    `);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }
        const sessionOwner = checkResult.rows[0].user_id;
        if (sessionOwner !== user.supabaseId) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        await db_1.db.execute((0, drizzle_orm_1.sql) `
      DELETE FROM auth.sessions 
      WHERE id = ${sessionId}::uuid;
    `);
        return res.json({ success: true });
    }
    catch (error) {
        console.error('Error deleting session:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
exports.default = router;
