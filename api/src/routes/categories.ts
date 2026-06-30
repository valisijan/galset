import { Router, Request, Response } from 'express';
import { db } from '../lib/db';
import { categories } from '../lib/db/schema';
import { asc } from 'drizzle-orm';

const router = Router();

let cachedCategoriesTree: any[] | null = null;
let cacheExpiry = 0;
const CACHE_TTL = 3600 * 1000; // 1 hour

async function getCategoriesTree() {
  const allRows = await db.select().from(categories).orderBy(asc(categories.id));
  
  // Build a map of parentId to children list
  const byParent = new Map<number | null, any[]>();
  for (const row of allRows) {
    const parent = row.parentId;
    if (!byParent.has(parent)) {
      byParent.set(parent, []);
    }
    byParent.get(parent)!.push({
      id: row.id,
      name: row.name,
      slug: row.slug,
      icon: row.icon,
      subcategories: []
    });
  }

  // Recursive helper to build tree
  function buildTree(parentId: number | null): any[] {
    const list = byParent.get(parentId) || [];
    for (const item of list) {
      const children = buildTree(item.id);
      if (children.length > 0) {
        item.subcategories = children;
      } else {
        delete item.subcategories; // remove empty subcategories array if any
      }
    }
    return list;
  }

  return buildTree(null);
}

export function clearCategoriesCache() {
  cachedCategoriesTree = null;
  cacheExpiry = 0;
}

export async function getCategoriesTreeCached() {
  // Always query the database to ensure immediate updates
  return getCategoriesTree();
}

// GET /categories
router.get('/', async (_req: Request, res: Response) => {
  try {
    const tree = await getCategoriesTreeCached();
    return res.json({ success: true, categories: tree });
  } catch (err) {
    console.error('Failed to load categories:', err);
    return res.status(500).json({ error: 'Failed to load categories' });
  }
});

// POST /categories/clear-cache - invalidate in-memory cache
router.post('/clear-cache', async (_req: Request, res: Response) => {
  clearCategoriesCache();
  return res.json({ success: true, message: 'Categories cache cleared' });
});

export default router;

