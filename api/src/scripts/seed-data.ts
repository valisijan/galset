import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { cityCoords } from '../lib/cityCoords';
import { categories, filters, filterUses, brands, countries, cities } from '../lib/db/schema';

dotenv.config();

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[šŠ]/g, 's')
    .replace(/[đĐ]/g, 'd')
    .replace(/[čČ]/g, 'c')
    .replace(/[ćĆ]/g, 'c')
    .replace(/[žŽ]/g, 'z')
    .replace(/[^-a-z0-9~\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const brandTypeMapping: Record<string, string> = {
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

async function run() {
  console.log('Connecting to database...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  const db = drizzle(pool);

  try {
    console.log('Truncating existing data...');
    await db.delete(filterUses);
    await db.delete(categories);
    await db.delete(filters);
    await db.delete(brands);
    await db.delete(cities);
    await db.delete(countries);
    console.log('Tables truncated successfully.');

    // 1. Seed Categories
    console.log('Loading categories...');
    const categoriesPath = 'c:/Users/Valisijan/Documents/galset/web/src/data/categories.json';
    const categoriesJson = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));

    function getNewIconUrl(oldIconPath: string | null): string | null {
      if (!oldIconPath) return null;
      if (oldIconPath.startsWith('http')) return oldIconPath;
      
      const parts = oldIconPath.split('/');
      let filename = parts[parts.length - 1];
      
      if (filename === 'jobs.svg') {
        filename = 'briefcase.svg';
      }
      
      return `https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/icons/${filename}`;
    }

    const categoryMap = new Map<number, number>();
    let categoryIdCounter = 1;

    async function seedCategory(cat: any, parentId: number | null) {
      const slug = cat.slug || cat.subslug || cat.childslug || slugify(cat.name);
      const newId = categoryIdCounter++;
      
      const [inserted] = await db.insert(categories).values({
        id: newId,
        name: cat.name,
        slug: slug,
        icon: getNewIconUrl(cat.icon),
        parentId: parentId
      }).returning({ id: categories.id });

      categoryMap.set(cat.id, inserted.id);

      if (cat.subcategories && Array.isArray(cat.subcategories)) {
        for (const sub of cat.subcategories) {
          await seedCategory(sub, inserted.id);
        }
      }
    }

    console.log('Seeding categories...');
    for (const cat of categoriesJson) {
      await seedCategory(cat, null);
    }
    console.log(`Seeded ${categoryMap.size} categories with sequential IDs.`);

    // 2. Seed Filter Definitions
    console.log('Loading filter definitions...');
    const definitionsDir = 'c:/Users/Valisijan/Documents/galset/web/src/data/filters/definitions';
    const filterFiles = fs.readdirSync(definitionsDir).filter(f => f.endsWith('.json'));

    const slugToDbIdMap = new Map<string, number>();
    const originalIdToDbIdMap = new Map<number, number>();

    for (const file of filterFiles) {
      const filePath = path.join(definitionsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8').trim();
      if (!content) {
        console.warn(`Skipping empty filter definition file: ${file}`);
        continue;
      }
      const filtersJson = JSON.parse(content);

      for (const f of filtersJson) {
        const slug = f.slug || slugify(f.name || `filter-${f.id}`);
        if (!slugToDbIdMap.has(slug)) {
          const [inserted] = await db.insert(filters).values({
            id: f.id,
            name: f.name || 'Unknown',
            slug: slug,
            type: f.type || 'text',
            options: f.options || null,
            source: f.source || null,
          }).returning({ id: filters.id });

          slugToDbIdMap.set(slug, inserted.id);
          originalIdToDbIdMap.set(f.id, inserted.id);
        } else {
          const existingId = slugToDbIdMap.get(slug)!;
          originalIdToDbIdMap.set(f.id, existingId);
        }
      }
    }
    console.log(`Seeded ${slugToDbIdMap.size} unique filters.`);

    // 3. Seed CategoryFilter pivot relations
    console.log('Loading use-filters...');
    const useFiltersPath = 'c:/Users/Valisijan/Documents/galset/web/src/data/filters/use-filters.json';
    const useFiltersJson = JSON.parse(fs.readFileSync(useFiltersPath, 'utf-8'));

    const categoryFilterRelationsToInsert: { categoryId: number; filterId: number }[] = [];
    const seenPairs = new Set<string>();

    if (useFiltersJson.specific && Array.isArray(useFiltersJson.specific)) {
      for (const spec of useFiltersJson.specific) {
        const oldCatId = parseInt(spec.categoryId);
        const newCatId = categoryMap.get(oldCatId);
        if (!newCatId) {
          console.warn(`Category with old ID ${oldCatId} not found in map.`);
          continue;
        }

        for (const oldFiltId of spec.filters) {
          const newFiltId = originalIdToDbIdMap.get(oldFiltId);
          if (!newFiltId) {
            console.warn(`Filter with old ID ${oldFiltId} not found in map.`);
            continue;
          }

          const pairKey = `${newCatId}-${newFiltId}`;
          if (!seenPairs.has(pairKey)) {
            seenPairs.add(pairKey);
            categoryFilterRelationsToInsert.push({
              categoryId: newCatId,
              filterId: newFiltId,
            });
          }
        }
      }
    }

    if (categoryFilterRelationsToInsert.length > 0) {
      // Drizzle insert can handle bulk array inserts
      await db.insert(filterUses).values(categoryFilterRelationsToInsert);
    }
    console.log(`Seeded ${categoryFilterRelationsToInsert.length} category-filter pivot relations.`);

    // 4. Seed Brands
    console.log('Loading brands...');
    const brandsDir = 'c:/Users/Valisijan/Documents/galset/web/src/data/filters/brands';
    const brandFiles = fs.readdirSync(brandsDir).filter(f => f.endsWith('.json'));

    let brandCount = 0;
    for (const file of brandFiles) {
      const type = brandTypeMapping[file] || file.replace('-brands.json', '');
      const filePath = path.join(brandsDir, file);
      const brandsJson = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      for (const item of brandsJson) {
        await db.insert(brands).values({
          type: type,
          brand: item.brand,
          models: item.models || [],
        });
        brandCount++;
      }
    }
    console.log(`Seeded ${brandCount} brand-model mappings.`);

    // 5. Seed Locations
    console.log('Loading locations...');
    const locationsPath = 'c:/Users/Valisijan/Documents/galset/web/src/data/locations.json';
    const locationsJson = JSON.parse(fs.readFileSync(locationsPath, 'utf-8'));

    let cityCount = 0;
    for (const countryName of Object.keys(locationsJson)) {
      const countrySlug = slugify(countryName);
      const [countryRow] = await db.insert(countries).values({
        name: countryName,
        slug: countrySlug,
      }).returning({ id: countries.id });

      const cityNames = locationsJson[countryName];
      for (const cityName of cityNames) {
        const citySlug = slugify(cityName);

        let coords = cityCoords[cityName];
        if (!coords) {
          const matchedKey = Object.keys(cityCoords).find(k => k.startsWith(cityName + ' |') || k.startsWith(cityName + ' ('));
          if (matchedKey) {
            coords = cityCoords[matchedKey];
          }
        }

        await db.insert(cities).values({
          name: cityName,
          slug: citySlug,
          countryId: countryRow.id,
          lat: coords ? coords.lat : null,
          lng: coords ? coords.lng : null,
        });
        cityCount++;
      }
    }
    console.log(`Seeded ${cityCount} cities across ${Object.keys(locationsJson).length} countries.`);
    
    console.log('Resetting database sequences...');
    await db.execute(sql`SELECT setval(pg_get_serial_sequence('"Category"', 'id'), coalesce(max(id), 1)) FROM "Category"`);
    await db.execute(sql`SELECT setval(pg_get_serial_sequence('"Filter"', 'id'), coalesce(max(id), 1)) FROM "Filter"`);
    
    console.log('Data seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

run();
