"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.optionalAuth = optionalAuth;
exports.signToken = signToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const supabase_1 = require("../lib/supabase");
async function requireAuth(req, res, next) {
    try {
        let token = '';
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
        else if (req.headers.cookie) {
            const cookies = req.headers.cookie.split(';').reduce((acc, c) => {
                const [key, val] = c.trim().split('=');
                if (key && val)
                    acc[key.trim()] = val.trim();
                return acc;
            }, {});
            const supabaseKey = Object.keys(cookies).find(key => key.includes('auth-token') || key === 'sb-access-token');
            token = (supabaseKey ? cookies[supabaseKey] : '') || cookies['next-auth.session-token'] || cookies['__Secure-next-auth.session-token'] || '';
            if (token.startsWith('%22') || token.startsWith('"')) {
                try {
                    const parsed = JSON.parse(decodeURIComponent(token));
                    if (parsed && parsed.access_token) {
                        token = parsed.access_token;
                    }
                }
                catch (_) { }
            }
        }
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // 1. Try Supabase JWT validation
        try {
            const supabaseSecret = process.env.SUPABASE_JWT_SECRET;
            let decodedSub = null;
            let sessionId = null;
            if (supabaseSecret) {
                try {
                    const decoded = jsonwebtoken_1.default.verify(token, supabaseSecret);
                    if (decoded && decoded.sub) {
                        decodedSub = decoded.sub;
                        sessionId = decoded.session_id || null;
                    }
                }
                catch (_) { }
            }
            if (!decodedSub) {
                const { data: { user: sbUser }, error } = await supabase_1.supabase.auth.getUser(token);
                if (sbUser && !error) {
                    decodedSub = sbUser.id;
                }
            }
            if (!sessionId) {
                try {
                    const decoded = jsonwebtoken_1.default.decode(token);
                    sessionId = decoded?.session_id || null;
                }
                catch (_) { }
            }
            if (decodedSub) {
                const user = await db_1.db.query.users.findFirst({
                    where: (0, drizzle_orm_1.eq)(schema_1.users.supabaseId, decodedSub),
                    columns: {
                        id: true,
                        email: true,
                        username: true,
                    }
                });
                if (user) {
                    req.user = {
                        id: user.id,
                        email: user.email,
                        username: user.username || undefined,
                        sessionId: sessionId || undefined,
                    };
                    return next();
                }
            }
        }
        catch (supabaseErr) {
            // Supabase JWT failed, fall back
        }
        // 2. Try legacy JWT validation
        try {
            const secret = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || process.env.AUTH_SECRET;
            if (secret) {
                const decoded = jsonwebtoken_1.default.verify(token, secret);
                req.user = decoded;
                try {
                    const decodedPayload = jsonwebtoken_1.default.decode(token);
                    const sessId = decodedPayload?.session_id || decodedPayload?.jti;
                    if (sessId && req.user) {
                        req.user.sessionId = sessId;
                    }
                }
                catch (_) { }
                return next();
            }
        }
        catch (jwtErr) {
            // Legacy JWT failed
        }
        return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token or session' });
    }
    catch (err) {
        return res.status(401).json({ error: 'Unauthorized', message: err.message });
    }
}
async function optionalAuth(req, _res, next) {
    try {
        let token = '';
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
        else if (req.headers.cookie) {
            const cookies = req.headers.cookie.split(';').reduce((acc, c) => {
                const [key, val] = c.trim().split('=');
                if (key && val)
                    acc[key.trim()] = val.trim();
                return acc;
            }, {});
            const supabaseKey = Object.keys(cookies).find(key => key.includes('auth-token') || key === 'sb-access-token');
            token = (supabaseKey ? cookies[supabaseKey] : '') || cookies['next-auth.session-token'] || cookies['__Secure-next-auth.session-token'] || '';
            if (token.startsWith('%22') || token.startsWith('"')) {
                try {
                    const parsed = JSON.parse(decodeURIComponent(token));
                    if (parsed && parsed.access_token) {
                        token = parsed.access_token;
                    }
                }
                catch (_) { }
            }
        }
        if (token) {
            // 1. Try Supabase JWT validation
            try {
                const supabaseSecret = process.env.SUPABASE_JWT_SECRET;
                let decodedSub = null;
                let sessionId = null;
                if (supabaseSecret) {
                    try {
                        const decoded = jsonwebtoken_1.default.verify(token, supabaseSecret);
                        if (decoded && decoded.sub) {
                            decodedSub = decoded.sub;
                            sessionId = decoded.session_id || null;
                        }
                    }
                    catch (_) { }
                }
                if (!decodedSub) {
                    const { data: { user: sbUser }, error } = await supabase_1.supabase.auth.getUser(token);
                    if (sbUser && !error) {
                        decodedSub = sbUser.id;
                    }
                }
                if (!sessionId) {
                    try {
                        const decoded = jsonwebtoken_1.default.decode(token);
                        sessionId = decoded?.session_id || null;
                    }
                    catch (_) { }
                }
                if (decodedSub) {
                    const user = await db_1.db.query.users.findFirst({
                        where: (0, drizzle_orm_1.eq)(schema_1.users.supabaseId, decodedSub),
                        columns: {
                            id: true,
                            email: true,
                            username: true,
                        }
                    });
                    if (user) {
                        req.user = {
                            id: user.id,
                            email: user.email,
                            username: user.username || undefined,
                            sessionId: sessionId || undefined,
                        };
                        return next();
                    }
                }
            }
            catch (supabaseErr) {
                // Supabase JWT failed
            }
            // 2. Try legacy JWT validation
            try {
                const secret = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || process.env.AUTH_SECRET;
                if (secret) {
                    const decoded = jsonwebtoken_1.default.verify(token, secret);
                    req.user = decoded;
                    try {
                        const decodedPayload = jsonwebtoken_1.default.decode(token);
                        const sessId = decodedPayload?.session_id || decodedPayload?.jti;
                        if (sessId && req.user) {
                            req.user.sessionId = sessId;
                        }
                    }
                    catch (_) { }
                    return next();
                }
            }
            catch {
                // Legacy JWT failed
            }
        }
    }
    catch {
        // Session invalid — just continue without user
    }
    return next();
}
function signToken(payload) {
    const secret = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || process.env.AUTH_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET not configured');
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: '365d' });
}
