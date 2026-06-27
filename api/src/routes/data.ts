import { Router, Request, Response } from 'express';
import { db } from '../lib/db';
import { categories, filters, filterUses, brands, countries, cities } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCategoriesTreeCached } from './categories';

const router = Router();

const globalSlugs = ["q", "sort", "category", "price", "condition", "exchange", "delivery", "seller", "country", "city", "other"];

const fileToType: Record<string, string> = {
  "aircraft-brands.json": "aircraft",
  "bus-brands.json": "buses",
  "camper-brands.json": "campers",
  "car-brands.json": "cars",
  "machinery-brands.json": "machinery",
  "motorcycle-brands.json": "motorcycles",
  "trailer-brands.json": "trailers",
  "truck-brands.json": "trucks",
  "van-brands.json": "vans",
  "watercraft-brands.json": "watercraft",
};

router.get(['/filters-data.json', '/filters-data'], async (_req: Request, res: Response) => {
  try {
    const allFilters = await db.select().from(filters);

    allFilters.sort((a, b) => {
      const indexA = globalSlugs.indexOf(a.slug);
      const indexB = globalSlugs.indexOf(b.slug);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.slug.localeCompare(b.slug);
    });



    return res.json(allFilters);
  } catch (error) {
    console.error("[filters-data] Error:", error);
    return res.status(500).json({ error: "Failed to load filters data" });
  }
});

router.get(['/categories.json', '/categories'], async (_req: Request, res: Response) => {
  try {
    const tree = await getCategoriesTreeCached();
    return res.json(tree);
  } catch (err) {
    console.error("[categories-data] Error:", err);
    return res.status(500).json({ error: 'Failed to load categories' });
  }
});

router.get(['/filters/use-filters.json', '/filters/use-filters'], async (_req: Request, res: Response) => {
  try {
    const filterRows = await db.select().from(filters);
    const pivotRows = await db.select().from(filterUses);
    const dbGlobalFilters = filterRows.filter(f => globalSlugs.includes(f.slug));
    dbGlobalFilters.sort((a, b) => globalSlugs.indexOf(a.slug) - globalSlugs.indexOf(b.slug));
    const globalIds = dbGlobalFilters.map(f => f.id);
    const specificMap = new Map<number, number[]>();
    for (const p of pivotRows) {
      if (!specificMap.has(p.categoryId)) {
        specificMap.set(p.categoryId, []);
      }
      specificMap.get(p.categoryId)!.push(p.filterId);
    }

    const specific = [];
    for (const [catId, filterIds] of specificMap.entries()) {
      specific.push({
        categoryId: catId.toString(),
        filters: filterIds
      });
    }

    return res.json({
      global: globalIds,
      specific: specific
    });
  } catch (error) {
    console.error("[use-filters] Error:", error);
    return res.status(500).json({ error: "Failed to load use-filters mapping" });
  }
});

router.get(['/locations.json', '/locations'], async (_req: Request, res: Response) => {
  try {
    const dbCountries = await db.select().from(countries);
    const dbCities = await db.select().from(cities);

    const locations: Record<string, string[]> = {};

    for (const country of dbCountries) {
      const countryCities = dbCities
        .filter(c => c.countryId === country.id)
        .map(c => c.name);
      locations[country.name] = countryCities;
    }

    return res.json(locations);
  } catch (error) {
    console.error("[locations] Error:", error);
    return res.status(500).json({ error: "Failed to load locations" });
  }
});

router.get('/brands', async (req: Request, res: Response) => {
  try {
    const type = req.query.type as string;
    if (!type) {
      return res.status(400).json({ error: "Missing type query parameter" });
    }

    const rows = await db.select().from(brands).where(eq(brands.type, type));
    const formatted = rows.map(r => ({
      brand: r.brand,
      models: r.models
    }));

    return res.json(formatted);
  } catch (error) {
    console.error("[brands] Error:", error);
    return res.status(500).json({ error: "Failed to load brands" });
  }
});

router.get('/filters/brands/:filename', async (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    const type = fileToType[filename];
    if (!type) {
      return res.status(404).json({ error: "Brand file type not found" });
    }

    const rows = await db.select().from(brands).where(eq(brands.type, type));
    const formatted = rows.map(r => ({
      brand: r.brand,
      models: r.models
    }));

    return res.json(formatted);
  } catch (error) {
    console.error("[brands-compat] Error:", error);
    return res.status(500).json({ error: "Failed to load brands compatibility route" });
  }
});

router.get('/*', async (req: Request, res: Response) => {
  try {
    const cleanPath = req.params[0].replace(/\.\./g, "");

    if (cleanPath === 'locations.json' || cleanPath === 'locations') {
      return res.redirect('/api/data/locations');
    }

    if (cleanPath === 'filters/use-filters.json' || cleanPath === 'filters/use-filters') {
      return res.redirect('/api/data/filters/use-filters');
    }

    return res.status(404).json({ error: 'Data resource not found' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
