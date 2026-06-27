import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { supabase } from '@/lib/supabase';

export interface AuthUser {
  id: number;
  email: string;
  username?: string;
  sessionId?: string;
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    let token = '';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').reduce((acc, c) => {
        const [key, val] = c.trim().split('=');
        if (key && val) acc[key.trim()] = val.trim();
        return acc;
      }, {} as Record<string, string>);
      
      const supabaseKey = Object.keys(cookies).find(key => key.includes('auth-token') || key === 'sb-access-token');
      token = (supabaseKey ? cookies[supabaseKey] : '') || cookies['next-auth.session-token'] || cookies['__Secure-next-auth.session-token'] || '';
      
      if (token.startsWith('%22') || token.startsWith('"')) {
        try {
          const parsed = JSON.parse(decodeURIComponent(token));
          if (parsed && parsed.access_token) {
            token = parsed.access_token;
          }
        } catch (_) {}
      }
    }

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 1. Try Supabase JWT validation
    try {
      const supabaseSecret = process.env.SUPABASE_JWT_SECRET;
      let decodedSub: string | null = null;
      let sessionId: string | null = null;

      if (supabaseSecret) {
        try {
          const decoded = jwt.verify(token, supabaseSecret) as { sub: string; email: string; session_id?: string };
          if (decoded && decoded.sub) {
            decodedSub = decoded.sub;
            sessionId = decoded.session_id || null;
          }
        } catch (_) {}
      }

      if (!decodedSub) {
        const { data: { user: sbUser }, error } = await supabase.auth.getUser(token);
        if (sbUser && !error) {
          decodedSub = sbUser.id;
        }
      }

      if (!sessionId) {
        try {
          const decoded = jwt.decode(token) as { session_id?: string } | null;
          sessionId = decoded?.session_id || null;
        } catch (_) {}
      }

      if (decodedSub) {
        const user = await db.query.users.findFirst({
          where: eq(users.supabaseId, decodedSub),
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
    } catch (supabaseErr) {
      // Supabase JWT failed, fall back
    }

    // 2. Try legacy JWT validation
    try {
      const secret = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || process.env.AUTH_SECRET;
      if (secret) {
        const decoded = jwt.verify(token, secret) as AuthUser;
        req.user = decoded;

        try {
          const decodedPayload = jwt.decode(token) as { session_id?: string; jti?: string } | null;
          const sessId = decodedPayload?.session_id || decodedPayload?.jti;
          if (sessId && req.user) {
            req.user.sessionId = sessId;
          }
        } catch (_) {}

        return next();
      }
    } catch (jwtErr) {
      // Legacy JWT failed
    }

    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token or session' });
  } catch (err: any) {
    return res.status(401).json({ error: 'Unauthorized', message: err.message });
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    let token = '';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').reduce((acc, c) => {
        const [key, val] = c.trim().split('=');
        if (key && val) acc[key.trim()] = val.trim();
        return acc;
      }, {} as Record<string, string>);
      
      const supabaseKey = Object.keys(cookies).find(key => key.includes('auth-token') || key === 'sb-access-token');
      token = (supabaseKey ? cookies[supabaseKey] : '') || cookies['next-auth.session-token'] || cookies['__Secure-next-auth.session-token'] || '';
      
      if (token.startsWith('%22') || token.startsWith('"')) {
        try {
          const parsed = JSON.parse(decodeURIComponent(token));
          if (parsed && parsed.access_token) {
            token = parsed.access_token;
          }
        } catch (_) {}
      }
    }

    if (token) {
      // 1. Try Supabase JWT validation
      try {
        const supabaseSecret = process.env.SUPABASE_JWT_SECRET;
        let decodedSub: string | null = null;
        let sessionId: string | null = null;

        if (supabaseSecret) {
          try {
            const decoded = jwt.verify(token, supabaseSecret) as { sub: string; email: string; session_id?: string };
            if (decoded && decoded.sub) {
              decodedSub = decoded.sub;
              sessionId = decoded.session_id || null;
            }
          } catch (_) {}
        }

        if (!decodedSub) {
          const { data: { user: sbUser }, error } = await supabase.auth.getUser(token);
          if (sbUser && !error) {
            decodedSub = sbUser.id;
          }
        }

        if (!sessionId) {
          try {
            const decoded = jwt.decode(token) as { session_id?: string } | null;
            sessionId = decoded?.session_id || null;
          } catch (_) {}
        }

        if (decodedSub) {
          const user = await db.query.users.findFirst({
            where: eq(users.supabaseId, decodedSub),
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
      } catch (supabaseErr) {
        // Supabase JWT failed
      }

      // 2. Try legacy JWT validation
      try {
        const secret = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || process.env.AUTH_SECRET;
        if (secret) {
          const decoded = jwt.verify(token, secret) as AuthUser;
          req.user = decoded;

          try {
            const decodedPayload = jwt.decode(token) as { session_id?: string; jti?: string } | null;
            const sessId = decodedPayload?.session_id || decodedPayload?.jti;
            if (sessId && req.user) {
              req.user.sessionId = sessId;
            }
          } catch (_) {}

          return next();
        }
      } catch {
        // Legacy JWT failed
      }
    }
  } catch {
    // Session invalid — just continue without user
  }
  return next();
}

export function signToken(payload: AuthUser): string {
  const secret = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || process.env.AUTH_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');
  return jwt.sign(payload, secret, { expiresIn: '365d' });
}
