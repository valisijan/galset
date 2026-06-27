import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';
import { users, ads } from '@/lib/db/schema';
import { eq, or, and, lt, sql } from 'drizzle-orm';
import { requireAuth, signToken } from '@/middleware/auth';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

const router = Router();

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email i lozinka su obavezni.' });

    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user || !user.password) return res.status(401).json({ error: 'Pogrešan email ili lozinka.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Pogrešan email ili lozinka.' });

    if (user.isDeactivated) {
      await db.update(users).set({ isDeactivated: false }).where(eq(users.id, user.id));
      await db.update(ads).set({ status: 'ACTIVE' }).where(and(eq(ads.userId, user.id), eq(ads.status, 'DEACTIVATED')));
    }

    const token = signToken({ id: user.id, email: user.email, username: user.username || undefined });


    return res.json({
      token,
      user: { id: user.id, email: user.email, username: user.username, fullName: user.fullName, profileImg: user.profileImg },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Greška na serveru.' });
  }
});

// GET /auth/check-availability
router.get('/check-availability', async (req: Request, res: Response) => {
  try {
    const email = req.query.email as string;
    const username = req.query.username as string;

    if (email) {
      const existingUser = await db.query.users.findFirst({ where: eq(users.email, email) });
      if (existingUser) {
        return res.status(400).json({ error: 'Email adresa je već zauzeta.' });
      }
    }

    if (username) {
      const existingUser = await db.query.users.findFirst({ where: eq(users.username, username.toLowerCase()) });
      if (existingUser) {
        return res.status(400).json({ error: 'Korisničko ime je već zauzeto.' });
      }
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Check availability error:', err);
    return res.status(500).json({ error: 'Greška na serveru.' });
  }
});

// GET /auth/me
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true, fullName: true, username: true, email: true, country: true, city: true, address: true, phone: true, birthDate: true, profileImg: true, description: true, isDeactivated: true },
    });
    if (!user) return res.status(404).json({ user: null });

    if (user.isDeactivated) {
      await db.update(users).set({ isDeactivated: false }).where(eq(users.id, userId));
      await db.update(ads).set({ status: 'ACTIVE' }).where(and(eq(ads.userId, userId), eq(ads.status, 'DEACTIVATED')));
      user.isDeactivated = false;
    }

    const { isDeactivated, ...userToSend } = user;
    return res.json({ user: userToSend });
  } catch (error) {
    console.error('Greška u /auth/me:', error);
    return res.status(500).json({ user: null });
  }
});

// POST /auth/logout
router.post('/logout', requireAuth, async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const { error } = await supabase.auth.admin.signOut(token);
        if (error) throw error;
      } catch (err) {
        console.error('Logout Supabase session deletion failed:', err);
      }
    }
    return res.json({ message: 'Odjavljeni ste' });
  } catch (err) {
    console.error('Logout session deletion failed:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /auth/check-username
router.post('/check-username', async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username is required' });
    const existingUser = await db.query.users.findFirst({ where: eq(users.username, username.toLowerCase()) });
    return res.json({ available: !existingUser });
  } catch (err: any) {
    return res.status(500).json({ error: err.message, available: true });
  }
});

// POST /auth/email-check
router.post('/email-check', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const existingUser = await db.query.users.findFirst({ where: eq(users.email, email) });

    return res.json({
      exists: !!existingUser,
      available: !existingUser,
      fullName: existingUser?.fullName || null,
      isDeactivated: !!existingUser?.isDeactivated,
      isPendingDeletion: false,
      daysUntilDeletion: undefined
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /auth/verify-password
router.post('/verify-password', requireAuth, async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Lozinka je obavezna.' });

    const userId = req.user!.id;
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user || !user.password) return res.status(401).json({ error: 'Korisnik nema lozinku.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Pogrešna lozinka.' });

    return res.json({ success: true });
  } catch (err: any) {
    console.error('Verify password error:', err);
    return res.status(500).json({ error: 'Greška na serveru.' });
  }
});

export default router;
