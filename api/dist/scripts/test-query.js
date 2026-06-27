"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const db_1 = require("../lib/db");
async function main() {
    try {
        const allPromotions = await db_1.db.query.adPromotions.findMany();
        console.log(`Total promotions in DB: ${allPromotions.length}`);
        for (const promo of allPromotions) {
            console.log(`Promo ID: ${promo.id}, Ad ID: ${promo.adId}, Type: ${promo.type}, Expires: ${promo.expiresAt}`);
        }
        process.exit(0);
    }
    catch (error) {
        console.error('Error running query script:', error);
        process.exit(1);
    }
}
main();
