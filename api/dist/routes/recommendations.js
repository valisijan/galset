"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const categories_1 = require("./categories");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
function getAllChildSlugs(slug, categories) {
    let slugs = [];
    const findAndAdd = (items) => {
        for (const item of items) {
            const currentSlug = item.slug;
            if (currentSlug === slug) {
                const collectSlugs = (node) => {
                    if (node.slug)
                        slugs.push(node.slug);
                    const children = node.subcategories || [];
                    children.forEach(collectSlugs);
                };
                collectSlugs(item);
                return true;
            }
            const children = item.subcategories;
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
function getCategoryNameBySlug(slug, categories) {
    if (slug === 'gift')
        return 'Poklanjam';
    let name = '';
    const findName = (items) => {
        for (const item of items) {
            if (item.slug === slug) {
                name = item.name;
                return true;
            }
            const children = item.subcategories;
            if (children && findName(children))
                return true;
        }
        return false;
    };
    findName(categories);
    return name || slug;
}
function getCategoryPath(slug, categories) {
    const findPath = (items, path) => {
        for (const item of items) {
            const currentSlug = item.slug || item.subslug || item.childslug;
            if (!currentSlug)
                continue;
            const newPath = [...path, currentSlug];
            if (currentSlug === slug)
                return newPath;
            const children = item.subcategories;
            if (children) {
                const found = findPath(children, newPath);
                if (found)
                    return found;
            }
        }
        return null;
    };
    return findPath(categories, []) || [slug];
}
// GET /recommendations
router.get('/', auth_1.optionalAuth, async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const now = new Date();
        const categoriesTree = await (0, categories_1.getCategoriesTreeCached)();
        let userCategorySlugs = [];
        let wishlistAds = [];
        let historyAds = [];
        // 1. Fetch Wishlist & History & Top categories for logged in users
        if (userId) {
            // Wishlist
            const wishlistData = await db_1.db.query.wishlists.findMany({
                where: (0, drizzle_orm_1.eq)(schema_1.wishlists.userId, userId),
                orderBy: [(0, drizzle_orm_1.desc)(schema_1.wishlists.createdAt)],
                limit: 7,
                with: {
                    ad: {
                        with: {
                            user: {
                                columns: { id: true, fullName: true, username: true, profileImg: true }
                            },
                            promotions: {
                                where: (adPromotions, { gt }) => gt(adPromotions.expiresAt, now)
                            }
                        }
                    }
                }
            });
            wishlistAds = wishlistData.map(w => w.ad).filter(Boolean);
            // Recently viewed history
            const historyData = await db_1.db.query.adViews.findMany({
                where: (0, drizzle_orm_1.eq)(schema_1.adViews.userId, userId),
                orderBy: [(0, drizzle_orm_1.desc)(schema_1.adViews.updatedAt)],
                limit: 40,
                with: {
                    ad: {
                        with: {
                            user: {
                                columns: { id: true, fullName: true, username: true, profileImg: true }
                            },
                            promotions: {
                                where: (adPromotions, { gt }) => gt(adPromotions.expiresAt, now)
                            }
                        }
                    }
                }
            });
            historyAds = historyData.map(h => h.ad).filter(Boolean);
            // Extract unique categories from history in order of recency
            const seenCategories = new Set();
            for (const ad of historyAds) {
                if (ad.category && ad.status === 'ACTIVE') {
                    seenCategories.add(ad.category);
                }
            }
            userCategorySlugs = Array.from(seenCategories).slice(0, 7);
            // Slice historyAds to top 7 items
            historyAds = historyAds.slice(0, 7);
        }
        else {
            // For guests, read from query parameters passed by frontend
            const guestCategoriesQuery = req.query.categories;
            if (guestCategoriesQuery) {
                const parsedSlugs = guestCategoriesQuery
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean);
                const seenCategories = new Set();
                for (const slug of parsedSlugs) {
                    seenCategories.add(slug);
                }
                userCategorySlugs = Array.from(seenCategories).slice(0, 7);
            }
        }
        // 2. Build final list of 7 categories (fill with defaults if fewer than 7)
        const defaultCategories = ['vehicles', 'real-estate', 'jobs', 'phones', 'fashion', 'home-furniture', 'gift'];
        const finalCategoriesSlugs = [...userCategorySlugs];
        for (const slug of defaultCategories) {
            if (finalCategoriesSlugs.length >= 7)
                break;
            if (!finalCategoriesSlugs.includes(slug)) {
                finalCategoriesSlugs.push(slug);
            }
        }
        // 3. Query ads for each category slug
        const categorySections = await Promise.all(finalCategoriesSlugs.map(async (slug) => {
            const title = getCategoryNameBySlug(slug, categoriesTree);
            let categoryAds = [];
            if (slug === 'gift') {
                // Special case: ads that are free
                categoryAds = await db_1.db.query.ads.findMany({
                    where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.ads.status, 'ACTIVE'), (0, drizzle_orm_1.gt)(schema_1.ads.expiresAt, now), (0, drizzle_orm_1.eq)(schema_1.ads.price, 0)),
                    orderBy: [(0, drizzle_orm_1.desc)(schema_1.ads.createdAt)],
                    limit: 7,
                    with: {
                        user: {
                            columns: { id: true, fullName: true, username: true, profileImg: true }
                        },
                        promotions: {
                            where: (adPromotions, { gt }) => gt(adPromotions.expiresAt, now)
                        }
                    }
                });
            }
            else {
                // Normal case: ads matching category slug and subcategories
                const childSlugs = getAllChildSlugs(slug, categoriesTree);
                categoryAds = await db_1.db.query.ads.findMany({
                    where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.ads.status, 'ACTIVE'), (0, drizzle_orm_1.gt)(schema_1.ads.expiresAt, now), (0, drizzle_orm_1.inArray)(schema_1.ads.category, childSlugs)),
                    orderBy: [(0, drizzle_orm_1.desc)(schema_1.ads.createdAt)],
                    limit: 7,
                    with: {
                        user: {
                            columns: { id: true, fullName: true, username: true, profileImg: true }
                        },
                        promotions: {
                            where: (adPromotions, { gt }) => gt(adPromotions.expiresAt, now)
                        }
                    }
                });
            }
            // Map jobs flag
            const jobsTree = categoriesTree.find(c => c.slug === 'jobs');
            const jobsSlugs = jobsTree ? getAllChildSlugs('jobs', [jobsTree]) : [];
            const mappedAds = categoryAds.map(ad => ({
                ...ad,
                isJob: jobsSlugs.includes(ad.category)
            }));
            // Determine correct "Prikaži više" href
            let href;
            if (slug === 'gift') {
                href = '/search?price_min=0&price_max=0&sort=new&page=1';
            }
            else {
                const pathSlugs = getCategoryPath(slug, categoriesTree);
                href = `/search/${pathSlugs.join('/')}?sort=new&page=1`;
            }
            return {
                categorySlug: slug,
                title,
                apiHref: href,
                ads: mappedAds
            };
        }));
        // Map jobs flag for wishlist and history ads
        const jobsTree = categoriesTree.find(c => c.slug === 'jobs');
        const jobsSlugs = jobsTree ? getAllChildSlugs('jobs', [jobsTree]) : [];
        const mappedWishlist = wishlistAds.map(ad => ({
            ...ad,
            isJob: jobsSlugs.includes(ad.category)
        }));
        const mappedHistory = historyAds.map(ad => ({
            ...ad,
            isJob: jobsSlugs.includes(ad.category)
        }));
        return res.json({
            success: true,
            categorySections,
            wishlist: mappedWishlist,
            history: mappedHistory
        });
    }
    catch (error) {
        console.error('Failed to load recommendations:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.default = router;
