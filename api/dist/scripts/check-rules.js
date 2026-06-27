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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function check() {
    const dumpPath = path.join(__dirname, "../../db_filters_dump.json");
    if (!fs.existsSync(dumpPath)) {
        console.error("Dump file not found!");
        return;
    }
    const filters = JSON.parse(fs.readFileSync(dumpPath, "utf8"));
    console.log(`Total filters in dump: ${filters.length}`);
    const isEquipmentOrSafety = (name, slug) => {
        const n = name.toLowerCase();
        const s = slug.toLowerCase();
        // Exclude specific list: Oprema, Sigurnost, Marke opreme/delova, Dodatne informacije
        if (n.includes("oprema") || s.includes("equipment"))
            return true;
        if (n.includes("sigurnost") || s.includes("safety"))
            return true;
        if (n.includes("karakteristike") || s.includes("features"))
            return true;
        if (n.includes("dodatn") || s.includes("additional"))
            return true;
        // Marke opreme/delova
        if (s.includes("brand") && (s.includes("part") || s.includes("apparel") || s.includes("gear") || s.includes("accessory") || s.includes("tyre") || s.includes("wheel-brand") || s.includes("helmet")))
            return true;
        return false;
    };
    const checkboxMultiFilters = filters.filter((f) => f.type === "checkbox-multi");
    console.log(`Checkbox-multi filters: ${checkboxMultiFilters.length}`);
    const yesRadio = [];
    const noRadio = [];
    checkboxMultiFilters.forEach((f) => {
        if (isEquipmentOrSafety(f.name, f.slug)) {
            noRadio.push(f);
        }
        else {
            yesRadio.push(f);
        }
    });
    console.log("\n==================================================");
    console.log(`WILL BE isFormRadio = true (Single choice on form) - Count: ${yesRadio.length}`);
    console.log("==================================================");
    yesRadio.forEach(f => console.log(`- ${f.name} (slug: ${f.slug})`));
    console.log("\n==================================================");
    console.log(`WILL BE isFormRadio = false (Multi choice on form) - Count: ${noRadio.length}`);
    console.log("==================================================");
    noRadio.forEach(f => console.log(`- ${f.name} (slug: ${f.slug})`));
}
check();
