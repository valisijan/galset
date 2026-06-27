import 'dotenv/config';
import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function runMigration() {
  console.log("🚀 Starting database schema and data migration...");

  try {
    // 1. Migrate condition data to attributes JSONB in Ad table
    console.log("📦 Migrating 'condition' data to 'attributes' in Ad table...");
    await db.execute(sql`
      UPDATE "Ad" 
      SET "attributes" = COALESCE("attributes", '{}'::jsonb) || jsonb_build_object('condition', "condition") 
      WHERE "condition" IS NOT NULL
    `);

    // 2. Migrate condition data to attributes JSONB in Draft table
    console.log("📦 Migrating 'condition' data to 'attributes' in Draft table...");
    await db.execute(sql`
      UPDATE "Draft" 
      SET "attributes" = COALESCE("attributes", '{}'::jsonb) || jsonb_build_object('condition', "condition") 
      WHERE "condition" IS NOT NULL
    `);

    // 3. Rename columns in Ad table
    console.log("🔄 Renaming columns in Ad table...");
    await db.execute(sql`ALTER TABLE "Ad" RENAME COLUMN "isContact" TO "isPriceOnRequest"`);
    await db.execute(sql`ALTER TABLE "Ad" RENAME COLUMN "street" TO "address"`);

    // 4. Rename columns in Draft table
    console.log("🔄 Renaming columns in Draft table...");
    await db.execute(sql`ALTER TABLE "Draft" RENAME COLUMN "isContact" TO "isPriceOnRequest"`);
    await db.execute(sql`ALTER TABLE "Draft" RENAME COLUMN "street" TO "address"`);

    // 5. Drop old condition column
    console.log("🗑️ Dropping 'condition' column from Ad and Draft tables...");
    await db.execute(sql`ALTER TABLE "Ad" DROP COLUMN IF EXISTS "condition"`);
    await db.execute(sql`ALTER TABLE "Draft" DROP COLUMN IF EXISTS "condition"`);

    console.log("✅ Database migration completed successfully!");
  } catch (error) {
    console.error("❌ Database migration failed:", error);
    process.exit(1);
  }
}

runMigration();
