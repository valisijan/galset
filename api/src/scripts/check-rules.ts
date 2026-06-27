import * as fs from "fs";
import * as path from "path";

function check() {
    const dumpPath = path.join(__dirname, "../../db_filters_dump.json");
    if (!fs.existsSync(dumpPath)) {
        console.error("Dump file not found!");
        return;
    }

    const filters = JSON.parse(fs.readFileSync(dumpPath, "utf8"));
    console.log(`Total filters in dump: ${filters.length}`);

    const isEquipmentOrSafety = (name: string, slug: string): boolean => {
        const n = name.toLowerCase();
        const s = slug.toLowerCase();
        
        // Exclude specific list: Oprema, Sigurnost, Marke opreme/delova, Dodatne informacije
        if (n.includes("oprema") || s.includes("equipment")) return true;
        if (n.includes("sigurnost") || s.includes("safety")) return true;
        if (n.includes("karakteristike") || s.includes("features")) return true;
        if (n.includes("dodatn") || s.includes("additional")) return true;
        
        // Marke opreme/delova
        if (s.includes("brand") && (s.includes("part") || s.includes("apparel") || s.includes("gear") || s.includes("accessory") || s.includes("tyre") || s.includes("wheel-brand") || s.includes("helmet"))) return true;
        
        return false;
    };

    const checkboxMultiFilters = filters.filter((f: any) => f.type === "checkbox-multi");
    console.log(`Checkbox-multi filters: ${checkboxMultiFilters.length}`);

    const yesRadio: any[] = [];
    const noRadio: any[] = [];

    checkboxMultiFilters.forEach((f: any) => {
        if (isEquipmentOrSafety(f.name, f.slug)) {
            noRadio.push(f);
        } else {
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
