"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
// @ts-nocheck
const generative_ai_1 = require("@google/generative-ai");
const db_1 = require("../../lib/db");
const schema_1 = require("../../lib/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
class AIController {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("[AIController] ❌ GREŠKA: GEMINI_API_KEY nije pronađen u .env fajlu!");
        }
        else {
            console.log(`[AIController] ✅ Gemini API ključ učitan (Dužina: ${apiKey.length})`);
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey || "");
    }
    async extractFilterParams(messages) {
        const latestUserMsg = messages[messages.length - 1]?.content || "";
        const msgLower = latestUserMsg.toLowerCase().trim();
        const pozdravi = ["cao", "ćao", "zdravo", "hello", "hi", "pozdrav", "ej", "hej", "pomoć", "pomoc", "ko si", "sta si", "šta si", "što si"];
        // Brza provera za skraćene poruke
        if (messages.length === 1 && msgLower.length < 10 && pozdravi.some(p => msgLower.includes(p))) {
            return { tip_upita: "greeting", kategorija: null, marka: null, model: null, kljucne_reci: null, grad: null, max_cena: null, min_cena: null };
        }
        const historyText = messages.slice(-3).map((m) => `${m.role === 'user' ? 'Korisnik' : 'Asistent'}: ${m.content}`).join('\n');
        const prompt = `Analiziraj upit za Galset oglasnik i vrati SAMO JSON.
Polja: tip_upita (search/chat/greeting), kategorija, marka, model, kljucne_reci, grad, max_cena, min_cena, zamena (yes/no), karoserija, gorivo, menjac, pogon, boja, km_min, km_max, godiste_min, godiste_max, stanje (new/used), oglasivac (individual/dealer), bliski_modeli (niz).

ODREĐIVANJE TIPA UPITA (tip_upita):
- "greeting": Ako korisnik samo pozdravlja (npr. "cao", "ćao", "zdravo", "hej") bez ikakvih drugih pitanja.
- "chat": Ako korisnik postavlja opšta pitanja, ćaska, pita o sajtu, traži pomoć, pita šta asistent može (npr. "ko si ti?", "kako radi pretraga?", "pomozi mi da nađem auto", "kakav je sajt?", "2+2") i slične opšte konverzacije gde NE traži konkretno pretragu baze oglasa za određene artikle/proizvode/vozila. Ako niste 100% sigurni da korisnik želi pretragu aktivnih oglasa, stavite "chat".
- "search": SAMO ako korisnik jasno i eksplicitno želi da pretraži, pronađe, kupi, iznajmi ili zameni specifičan oglas, proizvod, auto, nekretninu (npr. "tražim Audi A4", "prikaži mi oglase za stanove u beogradu", "kupujem iphone 13", "ima li oglasa za bicikle?").

MAPIRANJE:
- karoserija: limuzina->sedan, karavan->wagon, džip->suv
- gorivo: benzin->gasoline, dizel->diesel, plin->lpg
- menjac: automatik->automatic, manuelni->manual
- oglasivac: fizicko lice->individual, diler->dealer

Istorija i poslednji upit:
${historyText}`;
        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const response = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });
            const responseText = response.response.text().trim();
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            const contentToParse = jsonMatch ? jsonMatch[0] : responseText;
            const parsed = JSON.parse(contentToParse);
            console.log("[AIController] 📊 Parsovani parametri (sa istorijom):", parsed);
            return parsed;
        }
        catch (err) {
            console.error("[AIController] ❌ Greška pri ekstrakciji:", err.message);
            return { tip_upita: "chat", kategorija: null, marka: null, model: null, kljucne_reci: null, grad: null, max_cena: null, min_cena: null, tip_vozila: null, boja: null, snaga_ks_min: null, bliski_modeli: null };
        }
    }
    async extractVehicleFilters(userMessage) {
        const prompt = `Ti si napredni AI asistent za pretragu oglasa na sajtu za vozila (poput Polovnih Automobila). Tvoj jedini zadatak je da iz poruke korisnika izvučeš precizne tehničke filtere i vratiš ih u striktnom JSON formatu.

Korisnik može tražiti specifične modele (npr. "KTM SXF 250"), oblike karoserije ("kabrio"), boje ("crna") ili snagu motora ("800hp"). Tvoj posao je da standardizuješ te podatke.

Kada primiš poruku, obavezno vrati JSON u sledećem formatu:
{
  "filteri": {
    "marka": "String (npr. BMW, KTM, Audi) ili null",
    "model": "String (npr. M8, SXF 250, A4) ili null",
    "tip_vozila": "String (npr. kabriolet, karavan, limuzina, enduro) ili null",
    "boja": "String (npr. crna, bela, crvena) ili null",
    "snaga_ks_min": "Integer (izvuci iz '800hp' ili '800ks') ili null",
    "cena_max": "Integer ili null"
  },
  "strategija_ako_nema_rezultata": {
    "poruka_za_korisnika": "Tekstualni odgovor korisniku ako baza vrati 0 pogodaka. Uvek ponudi alternativu.",
    "alternativni_filteri": {
      "opis": "Šta tražiti kao zamenu",
      "bliski_modeli": ["String"],
      "popusti_filter": "Skini filter za boju ili snagu da proširiš pretragu"
    }
  }
}

Pravila:
- Ako korisnik pomene snagu u "hp" ili "ks", pretvori to u čist broj u polje "snaga_ks_min".
- Ako nema dovoljno detalja, polja koja fale postavi na null.
- Ne piši nikakav uvodni tekst, objašnjenja niti ćaskanje. Vrati SAMO čist JSON objekat.

Poruka korisnika: "${userMessage}"`;
        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const response = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });
            const responseText = response.response.text().trim();
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            const contentToParse = jsonMatch ? jsonMatch[0] : responseText;
            const parsed = JSON.parse(contentToParse);
            console.log("[AIController] 🚗 Parsovani filteri za vozila:", parsed);
            return parsed;
        }
        catch (err) {
            console.error("[AIController] ❌ Greška pri ekstrakciji filtera vozila:", err.message);
            return null;
        }
    }
    async searchAds(params, originalMessage) {
        console.log("[AIController] 🔍 Pokrećem paralelnu višeslojnu pretragu...");
        // Sloj 1 (precizan) i Sloj 2 (labav) — paralelno
        const looseParams = {
            // Zadrži samo tekstualne i cenovne filtere, bez attr filtera
            marka: params.marka,
            model: params.model,
            // tip_vozila/karoserija kao kljucna rec da bude u text search
            kljucne_reci: [params.kljucne_reci, params.tip_vozila, params.karoserija]
                .filter(Boolean).join(" ") || null,
            kategorija: params.kategorija,
            grad: params.grad,
            max_cena: params.max_cena,
            min_cena: params.min_cena,
        };
        const [precizni, labavi] = await Promise.all([
            this._executeSearch(params),
            this._executeSearch(looseParams),
        ]);
        if (precizni.length > 0) {
            console.log(`[AIController] ✅ Sloj 1 (Precizan) našao ${precizni.length} oglasa`);
            return precizni;
        }
        if (labavi.length > 0) {
            console.log(`[AIController] ✅ Sloj 2 (Labav) našao ${labavi.length} oglasa`);
            return labavi;
        }
        // Sloj 2.5: slični modeli i word fallback — paralelno
        const words = originalMessage
            .toLowerCase()
            .replace(/[^a-zčćšžđA-Z0-9\s]/gi, " ")
            .split(/\s+/)
            .filter(w => w.length > 2 && !["tražim", "nađi", "hocu", "imam", "ima", "koji", "koja", "koje", "auto", "kola", "oglas", "oglase", "prodaje", "kupi", "kupim", "neki", "neke", "neko", "samo", "brate", "mi", "ovde", "trazim", "najdi", "nadji", "trazi", "moze", "ima"].includes(w));
        const similarModelSearches = (params.bliski_modeli?.slice(0, 3) || []).map((model) => this._executeSearch({
            marka: params.marka || null,
            kljucne_reci: model,
            max_cena: params.max_cena,
            grad: params.grad,
        }));
        const wordSearches = words.slice(0, 3).map((word) => this._executeSearch({ kljucne_reci: word }));
        const fallbackResultArrays = await Promise.all([...similarModelSearches, ...wordSearches]);
        const seen = new Set();
        const merged = [];
        for (const arr of fallbackResultArrays) {
            for (const ad of arr) {
                if (!seen.has(ad.id)) {
                    merged.push(ad);
                    seen.add(ad.id);
                }
            }
            if (merged.length >= 6)
                break;
        }
        if (merged.length > 0) {
            console.log(`[AIController] ✅ Sloj 3 (Fallback) našao ${merged.length} oglasa`);
            return merged.slice(0, 6);
        }
        return [];
    }
    async _executeSearch(p) {
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.ads.status, "ACTIVE")];
        // --- Osnovno ---
        if (p.kategorija)
            conditions.push((0, drizzle_orm_1.ilike)(schema_1.ads.category, `%${p.kategorija}%`));
        if (p.grad)
            conditions.push((0, drizzle_orm_1.ilike)(schema_1.ads.city, `%${p.grad}%`));
        if (p.max_cena)
            conditions.push((0, drizzle_orm_1.lte)(schema_1.ads.price, p.max_cena));
        if (p.min_cena)
            conditions.push((0, drizzle_orm_1.gte)(schema_1.ads.price, p.min_cena));
        // --- Stanje oglasa ---
        if (p.stanje) {
            conditions.push((0, drizzle_orm_1.sql) `${schema_1.ads.attributes}->>'condition' = ${p.stanje}`);
        }
        // --- Oglasivač ---
        if (p.oglasivac) {
            conditions.push((0, drizzle_orm_1.sql) `${schema_1.ads.attributes}->>'seller_type' = ${p.oglasivac}`);
        }
        // --- Zamena ---
        if (p.zamena) {
            conditions.push((0, drizzle_orm_1.sql) `${schema_1.ads.attributes}->>'exchange' = ${p.zamena}`);
        }
        // --- Vozila - tip/karoserija ---
        const karoserija = p.karoserija || p.tip_vozila;
        if (karoserija) {
            const kLike = `%${karoserija}%`;
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.ads.title, kLike), (0, drizzle_orm_1.ilike)(schema_1.ads.description, kLike), (0, drizzle_orm_1.sql) `${schema_1.ads.attributes}->>'body' ILIKE ${kLike}`, (0, drizzle_orm_1.sql) `${schema_1.ads.attributes}->>'type' ILIKE ${kLike}`, (0, drizzle_orm_1.sql) `${schema_1.ads.attributes}->>'karoserija' ILIKE ${kLike}`));
        }
        // --- Gorivo ---
        if (p.gorivo) {
            conditions.push((0, drizzle_orm_1.sql) `${schema_1.ads.attributes}->>'fuel' = ${p.gorivo}`);
        }
        // --- Menjač ---
        if (p.menjac) {
            conditions.push((0, drizzle_orm_1.sql) `${schema_1.ads.attributes}->>'transmission' = ${p.menjac}`);
        }
        // --- Pogon ---
        if (p.pogon) {
            conditions.push((0, drizzle_orm_1.sql) `${schema_1.ads.attributes}->>'drive' = ${p.pogon}`);
        }
        // --- Boja ---
        const boja = p.boja;
        if (boja) {
            const bojaLike = `%${boja}%`;
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.ads.title, bojaLike), (0, drizzle_orm_1.ilike)(schema_1.ads.description, bojaLike), (0, drizzle_orm_1.sql) `${schema_1.ads.attributes}->>'color' ILIKE ${bojaLike}`, (0, drizzle_orm_1.sql) `${schema_1.ads.attributes}->>'boja' ILIKE ${bojaLike}`));
        }
        // --- Boja enterijera ---
        if (p.boja_enterijera) {
            conditions.push((0, drizzle_orm_1.sql) `${schema_1.ads.attributes}->>'interior-color' = ${p.boja_enterijera}`);
        }
        // --- Materijal enterijera ---
        if (p.materijal_enterijera) {
            conditions.push((0, drizzle_orm_1.sql) `${schema_1.ads.attributes}->>'interior-material' = ${p.materijal_enterijera}`);
        }
        // --- Oštećenje ---
        if (p.ostecenje) {
            conditions.push((0, drizzle_orm_1.sql) `${schema_1.ads.attributes}->>'damage' = ${p.ostecenje}`);
        }
        // --- Registracija ---
        if (p.registracija) {
            conditions.push((0, drizzle_orm_1.sql) `${schema_1.ads.attributes}->>'registration' = ${p.registracija}`);
        }
        // --- Poreklo ---
        if (p.poreklo) {
            conditions.push((0, drizzle_orm_1.sql) `${schema_1.ads.attributes}->>'origin' = ${p.poreklo}`);
        }
        // --- Emisiona klasa ---
        if (p.emisiona_klasa) {
            conditions.push((0, drizzle_orm_1.sql) `${schema_1.ads.attributes}->>'emission' = ${p.emisiona_klasa}`);
        }
        // --- Klima ---
        if (p.klima) {
            conditions.push((0, drizzle_orm_1.sql) `${schema_1.ads.attributes}->>'air-conditioning' = ${p.klima}`);
        }
        // --- Broj vrata ---
        if (p.broj_vrata) {
            conditions.push((0, drizzle_orm_1.sql) `${schema_1.ads.attributes}->>'doors' = ${p.broj_vrata}`);
        }
        // --- Strana volana ---
        if (p.strana_volana) {
            conditions.push((0, drizzle_orm_1.sql) `${schema_1.ads.attributes}->>'steering' = ${p.strana_volana}`);
        }
        // --- Kilometraža ---
        if (p.km_min)
            conditions.push((0, drizzle_orm_1.sql) `NULLIF(${schema_1.ads.attributes}->>'mileage', '')::numeric >= ${Number(p.km_min)}`);
        if (p.km_max)
            conditions.push((0, drizzle_orm_1.sql) `NULLIF(${schema_1.ads.attributes}->>'mileage', '')::numeric <= ${Number(p.km_max)}`);
        // --- Godište ---
        if (p.godiste_min)
            conditions.push((0, drizzle_orm_1.sql) `NULLIF(${schema_1.ads.attributes}->>'year', '')::int >= ${Number(p.godiste_min)}`);
        if (p.godiste_max)
            conditions.push((0, drizzle_orm_1.sql) `NULLIF(${schema_1.ads.attributes}->>'year', '')::int <= ${Number(p.godiste_max)}`);
        // --- Kubikaža ---
        if (p.kubikaza_min)
            conditions.push((0, drizzle_orm_1.sql) `NULLIF(${schema_1.ads.attributes}->>'engine-size', '')::numeric >= ${Number(p.kubikaza_min)}`);
        if (p.kubikaza_max)
            conditions.push((0, drizzle_orm_1.sql) `NULLIF(${schema_1.ads.attributes}->>'engine-size', '')::numeric <= ${Number(p.kubikaza_max)}`);
        // --- Snaga (kW ili KS) ---
        if (p.snaga_kw_min) {
            conditions.push((0, drizzle_orm_1.sql) `NULLIF(${schema_1.ads.attributes}->>'power-kw', '')::numeric >= ${Number(p.snaga_kw_min)}`);
        }
        else if (p.snaga_ks_min) {
            const kwEquiv = Math.round(Number(p.snaga_ks_min) / 1.35962);
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.sql) `NULLIF(${schema_1.ads.attributes}->>'power-kw', '')::numeric >= ${kwEquiv}`, (0, drizzle_orm_1.ilike)(schema_1.ads.title, `%${Number(p.snaga_ks_min)}%`)));
        }
        // --- Broj sedišta ---
        if (p.broj_sedista_min)
            conditions.push((0, drizzle_orm_1.sql) `NULLIF(${schema_1.ads.attributes}->>'seats', '')::int >= ${Number(p.broj_sedista_min)}`);
        if (p.broj_sedista_max)
            conditions.push((0, drizzle_orm_1.sql) `NULLIF(${schema_1.ads.attributes}->>'seats', '')::int <= ${Number(p.broj_sedista_max)}`);
        // --- Sigurnost (niz) ---
        if (Array.isArray(p.sigurnost) && p.sigurnost.length > 0) {
            for (const item of p.sigurnost) {
                conditions.push((0, drizzle_orm_1.sql) `${schema_1.ads.attributes}->'safety' @> ${JSON.stringify([item])}::jsonb`);
            }
        }
        // --- Oprema (niz) ---
        if (Array.isArray(p.oprema) && p.oprema.length > 0) {
            for (const item of p.oprema) {
                conditions.push((0, drizzle_orm_1.sql) `${schema_1.ads.attributes}->'equipment' @> ${JSON.stringify([item])}::jsonb`);
            }
        }
        // --- Dodatne informacije (niz) ---
        if (Array.isArray(p.extra_info) && p.extra_info.length > 0) {
            for (const item of p.extra_info) {
                conditions.push((0, drizzle_orm_1.sql) `${schema_1.ads.attributes}->'extra-info' @> ${JSON.stringify([item])}::jsonb`);
            }
        }
        // --- Tekstualna pretraga po marka/model/kljucne_reci ---
        const searchTerms = [p.marka, p.model, p.kljucne_reci].filter(Boolean);
        if (searchTerms.length > 0) {
            const textConditions = [];
            for (const term of searchTerms) {
                textConditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.ads.title, `%${term}%`), (0, drizzle_orm_1.ilike)(schema_1.ads.description, `%${term}%`), (0, drizzle_orm_1.ilike)(schema_1.ads.category, `%${term}%`), (0, drizzle_orm_1.ilike)(schema_1.ads.city, `%${term}%`)));
            }
            if (textConditions.length > 0) {
                conditions.push((0, drizzle_orm_1.and)(...textConditions));
            }
        }
        try {
            const results = await db_1.db
                .select({
                id: schema_1.ads.id,
                title: schema_1.ads.title,
                price: schema_1.ads.price,
                currency: schema_1.ads.currency,
                city: schema_1.ads.city,
                images: schema_1.ads.images,
                createdAt: schema_1.ads.createdAt,
                isPriceOnRequest: schema_1.ads.isPriceOnRequest,
                isReserved: schema_1.ads.isReserved,
            })
                .from(schema_1.ads)
                .where((0, drizzle_orm_1.and)(...conditions))
                .limit(10);
            return results.map(ad => ({
                ...ad,
                link: `/ad/${ad.id}`,
            }));
        }
        catch (err) {
            console.error("[AIController] ❌ DB Error:", err);
            return [];
        }
    }
    async generateFinalStream(messages, onFinish) {
        const latestUserMsg = messages[messages.length - 1]?.content || "";
        const msgLower = latestUserMsg.toLowerCase().trim();
        const pozdravi = ["cao", "ćao", "zdravo", "hello", "hi", "pozdrav", "ej", "hej", "dobar dan", "dobro jutro", "dobro veče"];
        let params;
        let isGreeting = (messages.length === 1 && msgLower.length < 10 && pozdravi.some(p => msgLower.includes(p)));
        if (isGreeting) {
            params = { tip_upita: "greeting" };
        }
        else {
            params = await this.extractFilterParams(messages);
            if (params.tip_upita === "greeting")
                isGreeting = true;
        }
        // Prazni rezultati po defaultu
        let dbResults = [];
        // Samo ako je tip upita 'search', radimo pretragu baze
        if (params.tip_upita === 'search') {
            dbResults = await this.searchAds(params, latestUserMsg);
        }
        const systemPrompt = `Ti si Galset AI, inteligentni i prirodni asistent za Galset platformu (najmoderniji oglasnik u Srbiji za vozila, nekretnine, mobilne telefone i druge kategorije).
Tvoj zadatak je da pomažeš korisnicima na koristan, prijateljski i profesionalan način. Odgovaraj uvek na srpskom jeziku.
Ponašaj se prirodno, kao ChatGPT ili Gemini. Budi komunikativan, nemoj zvučati previše šablonski ili robotski.

Ako je pretraga oglasa u bazi pokrenuta:
- Rezultati pretrage su ti dostavljeni u sistemskoj belešci na kraju poslednje poruke korisnika.
- Oglasi su automatski vizuelno prikazani korisniku na ekranu ispod tvog odgovora. Zato ih NEMOJ nabrajati, ispisivati njihove nazive ili linkove u svom tekstu! Samo ukratko i prirodno prokomentariši da si pronašao ponude i da ih može videti ispod.
- Ako nema rezultata pretrage, predloži alternativne modele ili da korisnik promeni/proširi filtere.`;
        const toolCallId = `call_search_${Date.now()}`;
        const geminiMessages = messages.slice(-10).map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content || "..." }]
        }));
        // Ubacujemo sistemski kontekst o rezultatima pretrage na kraj poslednje poruke korisnika
        const lastMsgIndex = geminiMessages.length - 1;
        if (lastMsgIndex >= 0 && geminiMessages[lastMsgIndex].role === 'user') {
            let contextText = "";
            if (params.tip_upita === 'search') {
                if (dbResults.length > 0) {
                    contextText = `\n\n[SISTEMSKA INFORMACIJA: Izvršena je pretraga baze. Pronađeno je ${dbResults.length} oglasa. Rezultati su automatski prikazani korisniku ispod tvog odgovora. Nemoj ih nabrajati u tekstu, samo reci da si ih pronašao i da ih može pogledati ispod.]`;
                }
                else {
                    const bliski = params.bliski_modeli?.length > 0
                        ? `Predloži alternativne modele poput: ${params.bliski_modeli.join(", ")}.`
                        : "Predloži da korisnik proširi pretragu ili ukloni neke filtere.";
                    contextText = `\n\n[SISTEMSKA INFORMACIJA: Izvršena je pretraga baze, ali nije pronađen nijedan oglas koji odgovara parametrima. Obavesti korisnika o tome na prirodan način. ${bliski}]`;
                }
            }
            else if (isGreeting) {
                contextText = `\n\n[SISTEMSKA INFORMACIJA: Korisnik te je samo pozdravio. Odgovori mu srdačno, pozdravi ga, predstavi se kao Galset AI i ponudi mu pomoć u pronalaženju oglasa.]`;
            }
            geminiMessages[lastMsgIndex].parts = [{ text: (messages[messages.length - 1]?.content || "...") + contextText }];
        }
        const model = this.genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemPrompt,
        });
        let fullResText = "";
        const hasResults = dbResults.length > 0;
        const readableStream = new ReadableStream({
            async start(controller) {
                let toolInvocations = [];
                try {
                    if (hasResults) {
                        const toolInvocation = { toolCallId, toolName: "searchAds", args: { query: latestUserMsg, params }, state: 'result', result: dbResults };
                        toolInvocations.push(toolInvocation);
                        controller.enqueue(`9:${JSON.stringify({ toolCallId, toolName: "searchAds", args: { query: latestUserMsg, params } })}\n`);
                        controller.enqueue(`a:${JSON.stringify({ toolCallId, result: dbResults })}\n`);
                    }
                    const geminiStream = await model.generateContentStream({
                        contents: geminiMessages,
                    });
                    for await (const chunk of geminiStream.stream) {
                        const text = chunk.text();
                        if (text) {
                            fullResText += text;
                            controller.enqueue(`0:${JSON.stringify(text)}\n`);
                        }
                    }
                }
                catch (err) {
                    console.error("[AIController] ❌ Stream error:", err.message);
                }
                finally {
                    controller.close();
                    await onFinish(fullResText, toolInvocations.length > 0 ? toolInvocations : undefined);
                }
            },
        });
        return new Response(readableStream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "X-Vercel-AI-Data-Stream": "v1",
            },
        });
    }
}
exports.AIController = AIController;
