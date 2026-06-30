import { db } from '@/lib/db';
import { ads, adPromotions, blockedUsers } from '@/lib/db/schema';
import { eq, and, or, ilike, inArray, notInArray, lt, gt, gte, lte, desc, asc, sql, count } from 'drizzle-orm';
import { cityCoords } from '@/lib/cityCoords';
import { getCategoriesTreeCached } from '@/routes/categories';


function getAllChildSlugs(slug: string, categories: any[]): string[] {
  let slugs: string[] = [];
  const findAndAdd = (items: any[]): boolean => {
    for (const item of items) {
      const currentSlug = item.slug || item.subslug || item.childslug;
      if (currentSlug === slug) {
        const collectSlugs = (node: any) => {
          const s = node.slug || node.subslug || node.childslug;
          if (s) slugs.push(s);
          const children = node.subcategories || node.children || [];
          children.forEach(collectSlugs);
        };
        collectSlugs(item);
        return true;
      }
      const children = item.subcategories || item.children;
      if (children && findAndAdd(children)) return true;
    }
    return false;
  };
  findAndAdd(categories);
  if (slugs.length === 0) return [slug];
  return slugs;
}

export async function fetchAdsServer(searchParams: any) {
  const category = searchParams.category;
  const search = searchParams.search || searchParams.q;
  const userId = searchParams.userId;
  const status = searchParams.status;
  const now = new Date();

  try {
    if (userId) {
      const parsedId = typeof userId === 'string' ? parseInt(userId) : userId;
      if (!isNaN(parsedId)) {
        await db.delete(ads).where(and(eq(ads.userId, parsedId), lt(ads.deletedAt, now)));
        await db.update(ads).set({ status: 'EXPIRED' }).where(and(eq(ads.userId, parsedId), eq(ads.status, 'ACTIVE'), lt(ads.expiresAt, now)));
      }
    }
    await db.delete(adPromotions).where(lt(adPromotions.expiresAt, now));
  } catch (maintErr) {
    console.error('Maintenance error in fetchAdsServer:', maintErr);
  }

  const conditions: any[] = [];

  if (category && category !== 'all-ads') {
    try {
      const categoriesList = await getCategoriesTreeCached();
      const allSlugs = getAllChildSlugs(category, categoriesList);
      conditions.push(inArray(ads.category, allSlugs));
    } catch (e) {
      console.error('Error loading categories in fetchAdsServer:', e);
    }
  }

  if (search) conditions.push(or(ilike(ads.title, `%${search}%`), ilike(ads.description, `%${search}%`)));

  if (userId) {
    const parsedId = typeof userId === 'string' ? parseInt(userId) : userId;
    if (!isNaN(parsedId)) conditions.push(eq(ads.userId, parsedId));
  }

  if (status) {
    const s = status.toLowerCase();
    if (s === 'active') conditions.push(and(eq(ads.status, 'ACTIVE'), gt(ads.expiresAt, now)));
    else if (s === 'expired') conditions.push(or(eq(ads.status, 'EXPIRED'), and(eq(ads.status, 'ACTIVE'), lt(ads.expiresAt, now))));
    else conditions.push(eq(ads.status, status.toUpperCase() as any));
  } else {
    conditions.push(and(eq(ads.status, 'ACTIVE'), gt(ads.expiresAt, now)));
  }

  if (!userId) {
    conditions.push(sql`NOT EXISTS (SELECT 1 FROM "User" u WHERE u.id = ${ads.userId} AND u."isDeactivated" = TRUE)`);
  }

  const currentUserId = searchParams.currentUserId;
  if (currentUserId) {
    try {
      const blocks = await db.query.blockedUsers.findMany({
        where: or(
          eq(blockedUsers.blockerId, Number(currentUserId)),
          eq(blockedUsers.blockedId, Number(currentUserId))
        )
      });
      const blockedUserIds = Array.from(new Set(
        blocks.flatMap((b: any) => [b.blockerId, b.blockedId])
      )).filter(id => id !== Number(currentUserId));

      if (blockedUserIds.length > 0) {
        conditions.push(notInArray(ads.userId, blockedUserIds));
      }
    } catch (err) {
      console.error('Error fetching blocked users in fetchAdsServer:', err);
    }
  }

  const page = parseInt(searchParams.page || '1');
  const limit = parseInt(searchParams.limit || '30');
  const skip = (page - 1) * limit;

  const priceMin = searchParams.price_min;
  const priceMax = searchParams.price_max;
  if (priceMin) conditions.push(gte(ads.price, parseFloat(priceMin)));
  if (priceMax) conditions.push(lte(ads.price, parseFloat(priceMax)));

  if (searchParams.isPriceOnRequest === 'true' || searchParams.isContact === 'true') conditions.push(eq(ads.isPriceOnRequest, true));
  if (searchParams.isFree === 'true') conditions.push(eq(ads.price, 0));

  const conditionParam = searchParams.condition || searchParams.stanje;
  if (conditionParam) {
    const conditionMap: Record<string, string> = { 'new': 'novo', 'like-new': 'kao-novo', 'used': 'polovno', 'damaged': 'neispravno', 'faulty': 'osteceno' };
    const mappedConditions = conditionParam.split(',').map((c: string) => conditionMap[c] || c);
    if (mappedConditions.length > 1) {
      conditions.push(inArray(sql`${ads.attributes}->>'condition'`, mappedConditions));
    } else {
      conditions.push(eq(sql`${ads.attributes}->>'condition'`, mappedConditions[0]));
    }
  }

  const locationParam = searchParams.location;
  if (locationParam) {
    if (locationParam.includes(',')) conditions.push(inArray(ads.city, locationParam.split(',')));
    else conditions.push(eq(ads.city, locationParam));
  }

  const otherParam = searchParams.other;
  if (otherParam) {
    const opts = typeof otherParam === 'string' ? otherParam.split(',') : (Array.isArray(otherParam) ? otherParam : [otherParam]);
    opts.forEach((opt: any) => {
      const sOpt = String(opt).trim();
      if (sOpt === 'only-price') {
        conditions.push(and(sql`${ads.price} IS NOT NULL`, gt(ads.price, 0), eq(ads.isPriceOnRequest, false)));
      } else if (sOpt === 'only-image') {
        conditions.push(sql`cardinality(${ads.images}) > 0`);
      } else if (sOpt === 'last-48h') {
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
        conditions.push(gte(ads.createdAt, fortyEightHoursAgo));
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
          const castedAttr = sql`(CASE WHEN ${ads.attributes}->>${baseKey} ~ '^[0-9]+(\\.[0-9]+)?$' THEN (${ads.attributes}->>${baseKey})::numeric ELSE NULL END)`;
          if (isMin) {
            conditions.push(gte(castedAttr, numericVal));
          } else {
            conditions.push(lte(castedAttr, numericVal));
          }
        }
      } else {
        const values = Array.isArray(value) ? value : (typeof value === 'string' && value.includes(',') ? value.split(',') : [value]);
        conditions.push(or(...values.map((v: any) => or(sql`${ads.attributes}->>${key} = ${String(v)}`, sql`${ads.attributes}->${key} @> jsonb_build_array(${String(v)}::text)`))));
      }
    }
  });

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const effectiveSortDate = sql`COALESCE(
    (
      SELECT ap."createdAt" + (3 * FLOOR(EXTRACT(EPOCH FROM (${now} - ap."createdAt")) / 259200) * INTERVAL '1 day')
      FROM "AdPromotion" ap
      WHERE ap."adId" = ${ads.id}
        AND ap.type = 'PRIORITY'
        AND ap."expiresAt" > ${now}
      LIMIT 1
    ),
    ${ads.createdAt}
  )`;

  let orderByQuery: any = desc(effectiveSortDate);
  const sort = searchParams.sort;
  if (sort === 'price_low') orderByQuery = asc(ads.price);
  else if (sort === 'price_high') orderByQuery = desc(ads.price);
  else if (sort === 'old') orderByQuery = asc(ads.createdAt);
  else if (sort === 'new') orderByQuery = desc(effectiveSortDate);

  const hasPremiumPromotion = sql`(CASE WHEN EXISTS (SELECT 1 FROM "AdPromotion" ap WHERE ap."adId" = ${ads.id} AND ap.type = 'COMBO' AND ap."expiresAt" > NOW()) THEN 1 ELSE 0 END)`;
  const premiumPromotionCreatedAt = sql`(SELECT MAX(ap."createdAt") FROM "AdPromotion" ap WHERE ap."adId" = ${ads.id} AND ap.type = 'COMBO' AND ap."expiresAt" > NOW())`;

  const hasTopPromotion = sql`(CASE WHEN EXISTS (SELECT 1 FROM "AdPromotion" ap WHERE ap."adId" = ${ads.id} AND ap.type = 'TOP' AND ap."expiresAt" > NOW()) THEN 1 ELSE 0 END)`;
  const topPromotionCreatedAt = sql`(SELECT MAX(ap."createdAt") FROM "AdPromotion" ap WHERE ap."adId" = ${ads.id} AND ap.type = 'TOP' AND ap."expiresAt" > NOW())`;

  let orderByList: any[];
  if (userId) {
    orderByList = [orderByQuery];
  } else {
    orderByList = [
      desc(hasPremiumPromotion),
      desc(premiumPromotionCreatedAt),
      desc(hasTopPromotion),
      desc(topPromotionCreatedAt),
      orderByQuery
    ];
  }

  // Statistika se računa samo ako je prijavljeni korisnik ujedno i vlasnik oglasa (npr. na /my-ads stranici)
  const includeStats = userId && currentUserId && Number(userId) === Number(currentUserId);

  const [fetchedAds, totalResult] = await Promise.all([
    db.query.ads.findMany({
      where,
      orderBy: (_fields: any, _ops: any) => orderByList,
      offset: skip,
      limit,
      columns: { id: true, title: true, status: true, price: true, currency: true, isPriceOnRequest: true, city: true, createdAt: true, images: true, userId: true, isReserved: true, attributes: true, category: true },
      extras: {
        viewscount: includeStats
          ? sql<number>`(SELECT count(*) FROM "AdView" WHERE "AdView"."adId" = "ads"."id")::int`.as('viewscount')
          : sql<number>`0`.as('viewscount'),
        wishlistcount: includeStats
          ? sql<number>`(SELECT count(*) FROM "Wishlist" WHERE "Wishlist"."adId" = "ads"."id")::int`.as('wishlistcount')
          : sql<number>`0`.as('wishlistcount'),
        messagescount: includeStats
          ? sql<number>`(SELECT count(*) FROM "Chat" WHERE "Chat"."adId" = "ads"."id")::int`.as('messagescount')
          : sql<number>`0`.as('messagescount'),
      },
      with: {
        user: { columns: { id: true, fullName: true, username: true, profileImg: true } },
        promotions: {
          where: (adPromotions: any, { gt }: any) => gt(adPromotions.expiresAt, new Date())
        }
      },
    }),
    db.select({ count: count() }).from(ads).where(where),
  ]);

  const categoriesTree = await getCategoriesTreeCached();
  const jobsSlugs = getAllChildSlugs("jobs", categoriesTree);

  const mappedAds = fetchedAds.map((ad: any) => {
    return {
      ...ad,
      isJob: jobsSlugs.includes(ad.category)
    };
  });

  return { ads: mappedAds, total: Number(totalResult[0].count) };
}
