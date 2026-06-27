"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const supabase_1 = require("../lib/supabase");
const router = (0, express_1.Router)();
// POST /auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'Email i lozinka su obavezni.' });
        const user = await db_1.db.query.users.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.users.email, email) });
        if (!user || !user.password)
            return res.status(401).json({ error: 'Pogrešan email ili lozinka.' });
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ error: 'Pogrešan email ili lozinka.' });
        if (user.isDeactivated) {
            await db_1.db.update(schema_1.users).set({ isDeactivated: false }).where((0, drizzle_orm_1.eq)(schema_1.users.id, user.id));
            await db_1.db.update(schema_1.ads).set({ status: 'ACTIVE' }).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.ads.userId, user.id), (0, drizzle_orm_1.eq)(schema_1.ads.status, 'DEACTIVATED')));
        }
        const token = (0, auth_1.signToken)({ id: user.id, email: user.email, username: user.username || undefined });
        return res.json({
            token,
            user: { id: user.id, email: user.email, username: user.username, fullName: user.fullName, profileImg: user.profileImg },
        });
    }
    catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Greška na serveru.' });
    }
});
// GET /auth/check-availability
router.get('/check-availability', async (req, res) => {
    try {
        const email = req.query.email;
        const username = req.query.username;
        if (email) {
            const existingUser = await db_1.db.query.users.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.users.email, email) });
            if (existingUser) {
                return res.status(400).json({ error: 'Email adresa je već zauzeta.' });
            }
        }
        if (username) {
            const existingUser = await db_1.db.query.users.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.users.username, username.toLowerCase()) });
            if (existingUser) {
                return res.status(400).json({ error: 'Korisničko ime je već zauzeto.' });
            }
        }
        return res.json({ success: true });
    }
    catch (err) {
        console.error('Check availability error:', err);
        return res.status(500).json({ error: 'Greška na serveru.' });
    }
});
// GET /auth/me
router.get('/me', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await db_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.id, userId),
            columns: { id: true, fullName: true, username: true, email: true, country: true, city: true, address: true, phone: true, birthDate: true, profileImg: true, description: true, isDeactivated: true },
        });
        if (!user)
            return res.status(404).json({ user: null });
        if (user.isDeactivated) {
            await db_1.db.update(schema_1.users).set({ isDeactivated: false }).where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
            await db_1.db.update(schema_1.ads).set({ status: 'ACTIVE' }).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.ads.userId, userId), (0, drizzle_orm_1.eq)(schema_1.ads.status, 'DEACTIVATED')));
            user.isDeactivated = false;
        }
        const { isDeactivated, ...userToSend } = user;
        return res.json({ user: userToSend });
    }
    catch (error) {
        console.error('Greška u /auth/me:', error);
        return res.status(500).json({ user: null });
    }
});
// POST /auth/logout
router.post('/logout', auth_1.requireAuth, async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const { error } = await supabase_1.supabase.auth.admin.signOut(token);
                if (error)
                    throw error;
            }
            catch (err) {
                console.error('Logout Supabase session deletion failed:', err);
            }
        }
        return res.json({ message: 'Odjavljeni ste' });
    }
    catch (err) {
        console.error('Logout session deletion failed:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
// POST /auth/check-username
router.post('/check-username', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username)
            return res.status(400).json({ error: 'Username is required' });
        const existingUser = await db_1.db.query.users.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.users.username, username.toLowerCase()) });
        return res.json({ available: !existingUser });
    }
    catch (err) {
        return res.status(500).json({ error: err.message, available: true });
    }
});
// POST /auth/email-check
router.post('/email-check', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ error: 'Email is required' });
        const existingUser = await db_1.db.query.users.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.users.email, email) });
        return res.json({
            exists: !!existingUser,
            available: !existingUser,
            fullName: existingUser?.fullName || null,
            isDeactivated: !!existingUser?.isDeactivated,
            isPendingDeletion: false,
            daysUntilDeletion: undefined
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// POST /auth/verify-password
router.post('/verify-password', auth_1.requireAuth, async (req, res) => {
    try {
        const { password } = req.body;
        if (!password)
            return res.status(400).json({ error: 'Lozinka je obavezna.' });
        const userId = req.user.id;
        const user = await db_1.db.query.users.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.users.id, userId) });
        if (!user || !user.password)
            return res.status(401).json({ error: 'Korisnik nema lozinku.' });
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ error: 'Pogrešna lozinka.' });
        return res.json({ success: true });
    }
    catch (err) {
        console.error('Verify password error:', err);
        return res.status(500).json({ error: 'Greška na serveru.' });
    }
});
exports.default = router;
