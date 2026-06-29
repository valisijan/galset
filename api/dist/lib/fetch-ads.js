"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAdsServer = fetchAdsServer;
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const categories_1 = require("../routes/categories");
function getAllChildSlugs(slug, categories) {
    let slugs = [];
    const findAndAdd = (items) => {
        for (const item of items) {
            const currentSlug = item.slug || item.subslug || item.childslug;
            if (currentSlug === slug) {
                const collectSlugs = (node) => {
                    const s = node.slug || node.subslug || node.childslug;
                    if (s)
                        slugs.push(s);
                    const children = node.subcategories || node.children || [];
                    children.forEach(collectSlugs);
                };
                collectSlugs(item);
                return true;
            }
            const children = item.subcategories || item.children;
            if (children && findAndAdd(children))
                return true;
        }
        return false;
    };
    findAndAdd(categories);
    if (slugs.length === 0)
        return [slug];
    return slugs;
}
async function fetchAdsServer(searchParams) {
    const category = searchParams.category;
    const search = searchParams.search || searchParams.q;
    const userId = searchParams.userId;
    const status = searchParams.status;
    const now = new Date();
    try {
        if (userId) {
            const parsedId = typeof userId === 'string' ? parseInt(userId) : userId;
            if (!isNaN(parsedId)) {
                await db_1.db.delete(schema_1.ads).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.ads.userId, parsedId), (0, drizzle_orm_1.lt)(schema_1.ads.deletedAt, now)));
                await db_1.db.update(schema_1.ads).set({ status: 'EXPIRED' }).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.ads.userId, parsedId), (0, drizzle_orm_1.eq)(schema_1.ads.status, 'ACTIVE'), (0, drizzle_orm_1.lt)(schema_1.ads.expiresAt, now)));
            }
        }
        await db_1.db.delete(schema_1.adPromotions).where((0, drizzle_orm_1.lt)(schema_1.adPromotions.expiresAt, now));
    }
    catch (maintErr) {
        console.error('Maintenance error in fetchAdsServer:', maintErr);
    }
    const conditions = [];
    if (category && category !== 'all-ads') {
        try {
            const categoriesList = await (0, categories_1.getCategoriesTreeCached)();
            const allSlugs = getAllChildSlugs(category, categoriesList);
            conditions.push((0, drizzle_orm_1.inArray)(schema_1.ads.category, allSlugs));
        }
        catch (e) {
            console.error('Error loading categories in fetchAdsServer:', e);
        }
    }
    if (search)
        conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.ads.title, `%${search}%`), (0, drizzle_orm_1.ilike)(schema_1.ads.description, `%${search}%`)));
    if (userId) {
        const parsedId = typeof userId === 'string' ? parseInt(userId) : userId;
        if (!isNaN(parsedId))
            conditions.push((0, drizzle_orm_1.eq)(schema_1.ads.userId, parsedId));
    }
    if (status) {
        const s = status.toLowerCase();
        if (s === 'active')
            conditions.push((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.ads.status, 'ACTIVE'), (0, drizzle_orm_1.gt)(schema_1.ads.expiresAt, now)));
        else if (s === 'expired')
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.ads.status, 'EXPIRED'), (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.ads.status, 'ACTIVE'), (0, drizzle_orm_1.lt)(schema_1.ads.expiresAt, now))));
        else
            conditions.push((0, drizzle_orm_1.eq)(schema_1.ads.status, status.toUpperCase()));
    }
    else {
        conditions.push((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.ads.status, 'ACTIVE'), (0, drizzle_orm_1.gt)(schema_1.ads.expiresAt, now)));
    }
    if (!userId) {
        conditions.push((0, drizzle_orm_1.sql) `NOT EXISTS (SELECT 1 FROM "User" u WHERE u.id = ${schema_1.ads.userId} AND u."isDeactivated" = TRUE)`);
    }
    const currentUserId = searchParams.currentUserId;
    if (currentUserId) {
        try {
            const blocks = await db_1.db.query.blockedUsers.findMany({
                where: (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.blockedUsers.blockerId, Number(currentUserId)), (0, drizzle_orm_1.eq)(schema_1.blockedUsers.blockedId, Number(currentUserId)))
            });
            const blockedUserIds = Array.from(new Set(blocks.flatMap((b) => [b.blockerId, b.blockedId]))).filter(id => id !== Number(currentUserId));
            if (blockedUserIds.length > 0) {
                conditions.push((0, drizzle_orm_1.notInArray)(schema_1.ads.userId, blockedUserIds));
            }
        }
        catch (err) {
            console.error('Error fetching blocked users in fetchAdsServer:', err);
        }
    }
    const page = parseInt(searchParams.page || '1');
    const limit = parseInt(searchParams.limit || '30');
    const skip = (page - 1) * limit;
    const priceMin = searchParams.price_min;
    const priceMax = searchParams.price_max;
    if (priceMin)
        conditions.push((0, drizzle_orm_1.gte)(schema_1.ads.price, parseFloat(priceMin)));
    if (priceMax)
        conditions.push((0, drizzle_orm_1.lte)(schema_1.ads.price, parseFloat(priceMax)));
    if (searchParams.isPriceOnRequest === 'true' || searchParams.isContact === 'true')
        conditions.push((0, drizzle_orm_1.eq)(schema_1.ads.isPriceOnRequest, true));
    if (searchParams.isFree === 'true')
        conditions.push((0, drizzle_orm_1.eq)(schema_1.ads.price, 0));
    const conditionParam = searchParams.condition || searchParams.stanje;
    if (conditionParam) {
        const conditionMap = { 'new': 'novo', 'like-new': 'kao-novo', 'used': 'polovno', 'damaged': 'neispravno', 'faulty': 'osteceno' };
        const mappedConditions = conditionParam.split(',').map((c) => conditionMap[c] || c);
        if (mappedConditions.length > 1) {
            conditions.push((0, drizzle_orm_1.inArray)((0, drizzle_orm_1.sql) `${schema_1.ads.attributes}->>'condition'`, mappedConditions));
        }
        else {
            conditions.push((0, drizzle_orm_1.eq)((0, drizzle_orm_1.sql) `${schema_1.ads.attributes}->>'condition'`, mappedConditions[0]));
        }
    }
    const locationParam = searchParams.location;
    if (locationParam) {
        if (locationParam.includes(','))
            conditions.push((0, drizzle_orm_1.inArray)(schema_1.ads.city, locationParam.split(',')));
        else
            conditions.push((0, drizzle_orm_1.eq)(schema_1.ads.city, locationParam));
    }
    const otherParam = searchParams.other;
    if (otherParam) {
        const opts = typeof otherParam === 'string' ? otherParam.split(',') : (Array.isArray(otherParam) ? otherParam : [otherParam]);
        opts.forEach((opt) => {
            const sOpt = String(opt).trim();
            if (sOpt === 'only-price') {
                conditions.push((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `${schema_1.ads.price} IS NOT NULL`, (0, drizzle_orm_1.gt)(schema_1.ads.price, 0), (0, drizzle_orm_1.eq)(schema_1.ads.isPriceOnRequest, false)));
            }
            else if (sOpt === 'only-image') {
                conditions.push((0, drizzle_orm_1.sql) `cardinality(${schema_1.ads.images}) > 0`);
            }
            else if (sOpt === 'last-48h') {
                const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
                conditions.push((0, drizzle_orm_1.gte)(schema_1.ads.createdAt, fortyEightHoursAgo));
            }
        });
    }
    const handledParams = ['category', 'search', 'q', 'userId', 'status', 'page', 'limit', 'sort', 'price_min', 'price_max', 'stanje', 'condition', 'location', 'isContact', 'isFree', 'currentUserId', 'other', 'filter_modal'];
    Object.keys(searchParams).forEach((key) => {
        const value = searchParams[key];
        if (!handledParams.includes(key) && value) {
            if (key.endsWith('_min') || key.endsWith('_max')) {
                const baseKey = key.slice(0, -4);
                const isMin = key.endsWith('_min');
                const numericVal = parseFloat(value);
                if (!isNaN(numericVal)) {
                    const castedAttr = (0, drizzle_orm_1.sql) `(CASE WHEN ${schema_1.ads.attributes}->>${baseKey} ~ '^[0-9]+(\\.[0-9]+)?$' THEN (${schema_1.ads.attributes}->>${baseKey})::numeric ELSE NULL END)`;
                    if (isMin) {
                        conditions.push((0, drizzle_orm_1.gte)(castedAttr, numericVal));
                    }
                    else {
                        conditions.push((0, drizzle_orm_1.lte)(castedAttr, numericVal));
                    }
                }
            }
            else {
                const values = Array.isArray(value) ? value : (typeof value === 'string' && value.includes(',') ? value.split(',') : [value]);
                conditions.push((0, drizzle_orm_1.or)(...values.map((v) => (0, drizzle_orm_1.or)((0, drizzle_orm_1.sql) `${schema_1.ads.attributes}->>${key} = ${String(v)}`, (0, drizzle_orm_1.sql) `${schema_1.ads.attributes}->${key} @> jsonb_build_array(${String(v)}::text)`))));
            }
        }
    });
    const where = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
    const effectiveSortDate = (0, drizzle_orm_1.sql) `COALESCE(
    (
      SELECT ap."createdAt" + (3 * FLOOR(EXTRACT(EPOCH FROM (${now} - ap."createdAt")) / 259200) * INTERVAL '1 day')
      FROM "AdPromotion" ap
      WHERE ap."adId" = ${schema_1.ads.id}
        AND ap.type = 'PRIORITY'
        AND ap."expiresAt" > ${now}
      LIMIT 1
    ),
    ${schema_1.ads.createdAt}
  )`;
    let orderByQuery = (0, drizzle_orm_1.desc)(effectiveSortDate);
    const sort = searchParams.sort;
    if (sort === 'price_low')
        orderByQuery = (0, drizzle_orm_1.asc)(schema_1.ads.price);
    else if (sort === 'price_high')
        orderByQuery = (0, drizzle_orm_1.desc)(schema_1.ads.price);
    else if (sort === 'old')
        orderByQuery = (0, drizzle_orm_1.asc)(schema_1.ads.createdAt);
    else if (sort === 'new')
        orderByQuery = (0, drizzle_orm_1.desc)(effectiveSortDate);
    const hasPremiumPromotion = (0, drizzle_orm_1.sql) `(CASE WHEN EXISTS (SELECT 1 FROM "AdPromotion" ap WHERE ap."adId" = ${schema_1.ads.id} AND ap.type = 'COMBO' AND ap."expiresAt" > NOW()) THEN 1 ELSE 0 END)`;
    const premiumPromotionCreatedAt = (0, drizzle_orm_1.sql) `(SELECT MAX(ap."createdAt") FROM "AdPromotion" ap WHERE ap."adId" = ${schema_1.ads.id} AND ap.type = 'COMBO' AND ap."expiresAt" > NOW())`;
    const hasTopPromotion = (0, drizzle_orm_1.sql) `(CASE WHEN EXISTS (SELECT 1 FROM "AdPromotion" ap WHERE ap."adId" = ${schema_1.ads.id} AND ap.type = 'TOP' AND ap."expiresAt" > NOW()) THEN 1 ELSE 0 END)`;
    const topPromotionCreatedAt = (0, drizzle_orm_1.sql) `(SELECT MAX(ap."createdAt") FROM "AdPromotion" ap WHERE ap."adId" = ${schema_1.ads.id} AND ap.type = 'TOP' AND ap."expiresAt" > NOW())`;
    let orderByList;
    if (userId) {
        orderByList = [orderByQuery];
    }
    else {
        orderByList = [
            (0, drizzle_orm_1.desc)(hasPremiumPromotion),
            (0, drizzle_orm_1.desc)(premiumPromotionCreatedAt),
            (0, drizzle_orm_1.desc)(hasTopPromotion),
            (0, drizzle_orm_1.desc)(topPromotionCreatedAt),
            orderByQuery
        ];
    }
    const [fetchedAds, totalResult] = await Promise.all([
        db_1.db.query.ads.findMany({
            where,
            orderBy: (_fields, _ops) => orderByList,
            offset: skip,
            limit,
            columns: { id: true, title: true, status: true, price: true, currency: true, isPriceOnRequest: true, city: true, createdAt: true, images: true, userId: true, isReserved: true, attributes: true, category: true },
            extras: {
                viewscount: (0, drizzle_orm_1.sql) `(SELECT count(*) FROM "AdView" WHERE "AdView"."adId" = "ads"."id")::int`.as('viewscount'),
                wishlistcount: (0, drizzle_orm_1.sql) `(SELECT count(*) FROM "Wishlist" WHERE "Wishlist"."adId" = "ads"."id")::int`.as('wishlistcount'),
                messagescount: (0, drizzle_orm_1.sql) `(SELECT count(*) FROM "Chat" WHERE "Chat"."adId" = "ads"."id")::int`.as('messagescount'),
            },
            with: {
                user: { columns: { id: true, fullName: true, username: true, profileImg: true } },
                promotions: {
                    where: (adPromotions, { gt }) => gt(adPromotions.expiresAt, new Date())
                }
            },
        }),
        db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.ads).where(where),
    ]);
    const categoriesTree = await (0, categories_1.getCategoriesTreeCached)();
    const jobsSlugs = getAllChildSlugs("jobs", categoriesTree);
    const mappedAds = fetchedAds.map((ad) => {
        return {
            ...ad,
            isJob: jobsSlugs.includes(ad.category)
        };
    });
    return { ads: mappedAds, total: Number(totalResult[0].count) };
}
