"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const powerFilterOptions = {
    units: [
        { name: "kW", slug: "kw", factor: 1 },
        { name: "KS", slug: "ps", factor: 1.35962 }
    ],
    default_unit: "kw",
    inputs: {
        min: { name: "Od", slug: "min" },
        max: { name: "Do", slug: "max" }
    }
};
async function main() {
    const result = await db_1.db
        .update(schema_1.filters)
        .set({ options: powerFilterOptions })
        .where((0, drizzle_orm_1.eq)(schema_1.filters.slug, "power"))
        .returning({ id: schema_1.filters.id, slug: schema_1.filters.slug, type: schema_1.filters.type });
    console.log("Updated filter:", result);
    process.exit(0);
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
