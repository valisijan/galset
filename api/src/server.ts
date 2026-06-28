import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { db } from './lib/db';
import { sql } from 'drizzle-orm';

import adsRouter from './routes/ads';
import authRouter from './routes/auth';
import aiRouter from './routes/ai';
import messagesRouter from './routes/messages';
import notificationsRouter from './routes/notifications';
import pushRouter from './routes/push';
import uploadRouter from './routes/upload';
import cronRouter from './routes/cron';
import usersRouter from './routes/users';
import userRouter from './routes/user';
import accountRouter from './routes/account';
import walletRouter from './routes/wallet';
import wishlistRouter from './routes/wishlist';
import followRouter from './routes/follow';
import followingRouter from './routes/following';
import blockRouter from './routes/block';
import reviewsRouter from './routes/reviews';
import reportRouter from './routes/report';
import reportIssueRouter from './routes/report-issue';
import sessionsRouter from './routes/sessions';
import historyRouter from './routes/history';
import dataRouter from './routes/data';
import categoriesRouter from './routes/categories';
import pricingRouter from './routes/pricing';
import recommendationsRouter from './routes/recommendations';
import uploadTempImageRouter from './routes/upload-temp-image';
import rotateImageRouter from './routes/rotate-image';

const app = express();

(async () => {
  try {
    await db.execute(sql`ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "readAt" TIMESTAMP`);
    await db.execute(sql`ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT`);
    await db.execute(sql`ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "actionUrl" TEXT`);

    await db.execute(sql`ALTER TABLE "AiMessage" ADD COLUMN IF NOT EXISTS "thumbUp" BOOLEAN DEFAULT false`);
    await db.execute(sql`ALTER TABLE "AiMessage" ADD COLUMN IF NOT EXISTS "thumbDown" BOOLEAN DEFAULT false`);
    console.log('✅ Columns migrated');
  } catch (err) {
    console.error('⚠️ Column migration error:', err);
  }
})();



const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (process.env.NODE_ENV === 'development') return callback(null, true);
    return callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Galset API is running' });
});

app.get('/health', async (_req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Health check failed:', error);
    res.status(500).json({ status: 'error' });
  }
});

app.use('/ads', adsRouter);
app.use('/auth', authRouter);
app.use('/ai', aiRouter);
app.use('/messages', messagesRouter);
app.use('/notifications', notificationsRouter);
app.use('/push', pushRouter);
app.use('/upload', uploadRouter);
app.use('/cron', cronRouter);
app.use('/users', usersRouter);
app.use('/user', userRouter);
app.use('/account', accountRouter);
app.use('/wallet', walletRouter);
app.use('/wishlist', wishlistRouter);
app.use('/follow', followRouter);
app.use('/following', followingRouter);
app.use('/block', blockRouter);
app.use('/reviews', reviewsRouter);
app.use('/report', reportRouter);
app.use('/report-issue', reportIssueRouter);
app.use('/sessions', sessionsRouter);
app.use('/history', historyRouter);
app.use('/data', dataRouter);
app.use('/categories', categoriesRouter);
app.use('/pricing', pricingRouter);
app.use('/recommendations', recommendationsRouter);
app.use('/upload-temp-image', uploadTempImageRouter);
app.use('/rotate-image', rotateImageRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Galset API running on port ${PORT}`);
  console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);

  if (process.env.NODE_ENV === 'development') {
    const CRON_SECRET = process.env.CRON_SECRET;
    setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:${PORT}/cron/cleanup`, {
          headers: {
            'Authorization': `Bearer ${CRON_SECRET}`
          }
        });
        const data = await res.json() as any;
        if (data.expiredAdsNotifications?.sent > 0 || data.ads?.markedExpired > 0) {
          console.log('[LOCAL CRON SIMULATOR]', data);
        }
      } catch (err: any) {
        console.error('[LOCAL CRON SIMULATOR ERROR]', err.message);
      }
    }, 15000);
  }
});

export default app;
