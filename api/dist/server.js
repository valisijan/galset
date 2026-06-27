"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./lib/db");
const drizzle_orm_1 = require("drizzle-orm");
const ads_1 = __importDefault(require("./routes/ads"));
const auth_1 = __importDefault(require("./routes/auth"));
const ai_1 = __importDefault(require("./routes/ai"));
const messages_1 = __importDefault(require("./routes/messages"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const push_1 = __importDefault(require("./routes/push"));
const upload_1 = __importDefault(require("./routes/upload"));
const cron_1 = __importDefault(require("./routes/cron"));
const users_1 = __importDefault(require("./routes/users"));
const user_1 = __importDefault(require("./routes/user"));
const account_1 = __importDefault(require("./routes/account"));
const wallet_1 = __importDefault(require("./routes/wallet"));
const wishlist_1 = __importDefault(require("./routes/wishlist"));
const follow_1 = __importDefault(require("./routes/follow"));
const following_1 = __importDefault(require("./routes/following"));
const block_1 = __importDefault(require("./routes/block"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const report_1 = __importDefault(require("./routes/report"));
const report_issue_1 = __importDefault(require("./routes/report-issue"));
const sessions_1 = __importDefault(require("./routes/sessions"));
const history_1 = __importDefault(require("./routes/history"));
const data_1 = __importDefault(require("./routes/data"));
const categories_1 = __importDefault(require("./routes/categories"));
const pricing_1 = __importDefault(require("./routes/pricing"));
const recommendations_1 = __importDefault(require("./routes/recommendations"));
const upload_temp_image_1 = __importDefault(require("./routes/upload-temp-image"));
const app = (0, express_1.default)();
(async () => {
    try {
        await db_1.db.execute((0, drizzle_orm_1.sql) `ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "readAt" TIMESTAMP`);
        await db_1.db.execute((0, drizzle_orm_1.sql) `ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT`);
        await db_1.db.execute((0, drizzle_orm_1.sql) `ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "actionUrl" TEXT`);
        await db_1.db.execute((0, drizzle_orm_1.sql) `ALTER TABLE "AiMessage" ADD COLUMN IF NOT EXISTS "thumbUp" BOOLEAN DEFAULT false`);
        await db_1.db.execute((0, drizzle_orm_1.sql) `ALTER TABLE "AiMessage" ADD COLUMN IF NOT EXISTS "thumbDown" BOOLEAN DEFAULT false`);
        console.log('✅ Columns migrated');
    }
    catch (err) {
        console.error('⚠️ Column migration error:', err);
    }
})();
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(o => o.trim());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        if (process.env.NODE_ENV === 'development')
            return callback(null, true);
        return callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.get('/', (_req, res) => {
    res.json({ status: 'ok', message: 'Galset API is running' });
});
app.get('/health', async (_req, res) => {
    try {
        await db_1.db.execute((0, drizzle_orm_1.sql) `SELECT 1`);
        res.json({ status: 'ok' });
    }
    catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({ status: 'error' });
    }
});
app.use('/ads', ads_1.default);
app.use('/auth', auth_1.default);
app.use('/ai', ai_1.default);
app.use('/messages', messages_1.default);
app.use('/notifications', notifications_1.default);
app.use('/push', push_1.default);
app.use('/upload', upload_1.default);
app.use('/cron', cron_1.default);
app.use('/users', users_1.default);
app.use('/user', user_1.default);
app.use('/account', account_1.default);
app.use('/wallet', wallet_1.default);
app.use('/wishlist', wishlist_1.default);
app.use('/follow', follow_1.default);
app.use('/following', following_1.default);
app.use('/block', block_1.default);
app.use('/reviews', reviews_1.default);
app.use('/report', report_1.default);
app.use('/report-issue', report_issue_1.default);
app.use('/sessions', sessions_1.default);
app.use('/history', history_1.default);
app.use('/data', data_1.default);
app.use('/categories', categories_1.default);
app.use('/pricing', pricing_1.default);
app.use('/recommendations', recommendations_1.default);
app.use('/upload-temp-image', upload_temp_image_1.default);
app.use((err, _req, res, _next) => {
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
                const data = await res.json();
                if (data.expiredAdsNotifications?.sent > 0 || data.ads?.markedExpired > 0) {
                    console.log('[LOCAL CRON SIMULATOR]', data);
                }
            }
            catch (err) {
                console.error('[LOCAL CRON SIMULATOR ERROR]', err.message);
            }
        }, 15000);
    }
});
exports.default = app;
