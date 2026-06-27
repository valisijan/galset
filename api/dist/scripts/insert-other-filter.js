"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
async function main() {
    const client = new pg_1.Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    console.log("Connected to database.");
    // Check if other filter exists
    const check = await client.query('SELECT * FROM "Filter" WHERE slug = \'other\'');
    if (check.rows.length === 0) {
        // Insert new filter
        const query = `
            INSERT INTO "Filter" (id, name, slug, type, options, source, "isFormRadio")
            VALUES (218, 'Ostalo', 'other', 'checkbox-multi', $1, null, false)
        `;
        const options = [
            { name: "Samo sa cenom", slug: "only-price" },
            { name: "Samo sa slikom", slug: "only-image" },
            { name: "Oglasi u poslednjih 48h", slug: "last-48h" }
        ];
        await client.query(query, [JSON.stringify(options)]);
        console.log("Successfully inserted new 'other' filter.");
    }
    else {
        console.log("Filter 'other' already exists.");
    }
    await client.end();
    process.exit(0);
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
