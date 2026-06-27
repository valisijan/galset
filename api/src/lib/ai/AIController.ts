// @ts-nocheck
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db";
import { ads } from "@/lib/db/schema";
import { eq, ilike, and, lte, or, SQL, gte, sql } from "drizzle-orm";

export class AIController {
    private genAI: GoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("[AIController] ❌ GREŠKA: GEMINI_API_KEY nije pronađen u .env fajlu!");
        } else {
            console.log(`[AIController] ✅ Gemini API ključ učitan (Dužina: ${apiKey.length})`);
        }

        this.genAI = new GoogleGenerativeAI(apiKey || "");
    }

    public async extractFilterParams(messages: any[]): Promise<any> {
        const latestUserMsg = messages[messages.length - 1]?.content || "";
        const msgLower = latestUserMsg.toLowerCase().trim();
        const pozdravi = ["cao", "ćao", "zdravo", "hello", "hi", "pozdrav", "ej", "hej", "pomoć", "pomoc", "ko si", "sta si", "šta si", "što si"];

        // Brza provera za skraćene poruke
        if (messages.length === 1 && msgLower.length < 10 && pozdravi.some(p => msgLower.includes(p))) {
            return { tip_upita: "greeting", kategorija: null, marka: null, model: null, kljucne_reci: null, grad: null, max_cena: null, min_cena: null };
        }

        const historyText = messages.slice(-3).map((m: any) => `${m.role === 'user' ? 'Korisnik' : 'Asistent'}: ${m.content}`).join('\n');

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
        } catch (err: any) {
            console.error("[AIController] ❌ Greška pri ekstrakciji:", err.message);
            return { tip_upita: "chat", kategorija: null, marka: null, model: null, kljucne_reci: null, grad: null, max_cena: null, min_cena: null, tip_vozila: null, boja: null, snaga_ks_min: null, bliski_modeli: null };
        }
    }

    public async extractVehicleFilters(userMessage: string): Promise<any> {
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
        } catch (err: any) {
            console.error("[AIController] ❌ Greška pri ekstrakciji filtera vozila:", err.message);
            return null;
        }
    }

    public async searchAds(params: any, originalMessage: string) {
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

        const similarModelSearches = (params.bliski_modeli?.slice(0, 3) || []).map((model: string) =>
            this._executeSearch({
                marka: params.marka || null,
                kljucne_reci: model,
                max_cena: params.max_cena,
                grad: params.grad,
            })
        );

        const wordSearches = words.slice(0, 3).map((word: string) =>
            this._executeSearch({ kljucne_reci: word })
        );

        const fallbackResultArrays = await Promise.all([...similarModelSearches, ...wordSearches]);

        const seen = new Set<number>();
        const merged: any[] = [];
        for (const arr of fallbackResultArrays) {
            for (const ad of arr) {
                if (!seen.has(ad.id)) {
                    merged.push(ad);
                    seen.add(ad.id);
                }
            }
            if (merged.length >= 6) break;
        }

        if (merged.length > 0) {
            console.log(`[AIController] ✅ Sloj 3 (Fallback) našao ${merged.length} oglasa`);
            return merged.slice(0, 6);
        }

        return [];
    }

    private async _executeSearch(p: any) {
        const conditions: SQL[] = [eq(ads.status, "ACTIVE")];

        // --- Osnovno ---
        if (p.kategorija) conditions.push(ilike(ads.category, `%${p.kategorija}%`));
        if (p.grad) conditions.push(ilike(ads.city, `%${p.grad}%`));
        if (p.max_cena) conditions.push(lte(ads.price, p.max_cena));
        if (p.min_cena) conditions.push(gte(ads.price, p.min_cena));

        // --- Stanje oglasa ---
        if (p.stanje) {
            conditions.push(sql`${ads.attributes}->>'condition' = ${p.stanje}` as SQL);
        }

        // --- Oglasivač ---
        if (p.oglasivac) {
            conditions.push(sql`${ads.attributes}->>'seller_type' = ${p.oglasivac}` as SQL);
        }

        // --- Zamena ---
        if (p.zamena) {
            conditions.push(sql`${ads.attributes}->>'exchange' = ${p.zamena}` as SQL);
        }

        // --- Vozila - tip/karoserija ---
        const karoserija = p.karoserija || p.tip_vozila;
        if (karoserija) {
            const kLike = `%${karoserija}%`;
            conditions.push(or(
                ilike(ads.title, kLike),
                ilike(ads.description, kLike),
                sql`${ads.attributes}->>'body' ILIKE ${kLike}`,
                sql`${ads.attributes}->>'type' ILIKE ${kLike}`,
                sql`${ads.attributes}->>'karoserija' ILIKE ${kLike}`
            ) as SQL);
        }

        // --- Gorivo ---
        if (p.gorivo) {
            conditions.push(sql`${ads.attributes}->>'fuel' = ${p.gorivo}` as SQL);
        }

        // --- Menjač ---
        if (p.menjac) {
            conditions.push(sql`${ads.attributes}->>'transmission' = ${p.menjac}` as SQL);
        }

        // --- Pogon ---
        if (p.pogon) {
            conditions.push(sql`${ads.attributes}->>'drive' = ${p.pogon}` as SQL);
        }

        // --- Boja ---
        const boja = p.boja;
        if (boja) {
            const bojaLike = `%${boja}%`;
            conditions.push(or(
                ilike(ads.title, bojaLike),
                ilike(ads.description, bojaLike),
                sql`${ads.attributes}->>'color' ILIKE ${bojaLike}`,
                sql`${ads.attributes}->>'boja' ILIKE ${bojaLike}`
            ) as SQL);
        }

        // --- Boja enterijera ---
        if (p.boja_enterijera) {
            conditions.push(sql`${ads.attributes}->>'interior-color' = ${p.boja_enterijera}` as SQL);
        }

        // --- Materijal enterijera ---
        if (p.materijal_enterijera) {
            conditions.push(sql`${ads.attributes}->>'interior-material' = ${p.materijal_enterijera}` as SQL);
        }

        // --- Oštećenje ---
        if (p.ostecenje) {
            conditions.push(sql`${ads.attributes}->>'damage' = ${p.ostecenje}` as SQL);
        }

        // --- Registracija ---
        if (p.registracija) {
            conditions.push(sql`${ads.attributes}->>'registration' = ${p.registracija}` as SQL);
        }

        // --- Poreklo ---
        if (p.poreklo) {
            conditions.push(sql`${ads.attributes}->>'origin' = ${p.poreklo}` as SQL);
        }

        // --- Emisiona klasa ---
        if (p.emisiona_klasa) {
            conditions.push(sql`${ads.attributes}->>'emission' = ${p.emisiona_klasa}` as SQL);
        }

        // --- Klima ---
        if (p.klima) {
            conditions.push(sql`${ads.attributes}->>'air-conditioning' = ${p.klima}` as SQL);
        }

        // --- Broj vrata ---
        if (p.broj_vrata) {
            conditions.push(sql`${ads.attributes}->>'doors' = ${p.broj_vrata}` as SQL);
        }

        // --- Strana volana ---
        if (p.strana_volana) {
            conditions.push(sql`${ads.attributes}->>'steering' = ${p.strana_volana}` as SQL);
        }

        // --- Kilometraža ---
        if (p.km_min) conditions.push(sql`NULLIF(${ads.attributes}->>'mileage', '')::numeric >= ${Number(p.km_min)}` as SQL);
        if (p.km_max) conditions.push(sql`NULLIF(${ads.attributes}->>'mileage', '')::numeric <= ${Number(p.km_max)}` as SQL);

        // --- Godište ---
        if (p.godiste_min) conditions.push(sql`NULLIF(${ads.attributes}->>'year', '')::int >= ${Number(p.godiste_min)}` as SQL);
        if (p.godiste_max) conditions.push(sql`NULLIF(${ads.attributes}->>'year', '')::int <= ${Number(p.godiste_max)}` as SQL);

        // --- Kubikaža ---
        if (p.kubikaza_min) conditions.push(sql`NULLIF(${ads.attributes}->>'engine-size', '')::numeric >= ${Number(p.kubikaza_min)}` as SQL);
        if (p.kubikaza_max) conditions.push(sql`NULLIF(${ads.attributes}->>'engine-size', '')::numeric <= ${Number(p.kubikaza_max)}` as SQL);

        // --- Snaga (kW ili KS) ---
        if (p.snaga_kw_min) {
            conditions.push(sql`NULLIF(${ads.attributes}->>'power-kw', '')::numeric >= ${Number(p.snaga_kw_min)}` as SQL);
        } else if (p.snaga_ks_min) {
            const kwEquiv = Math.round(Number(p.snaga_ks_min) / 1.35962);
            conditions.push(or(
                sql`NULLIF(${ads.attributes}->>'power-kw', '')::numeric >= ${kwEquiv}`,
                ilike(ads.title, `%${Number(p.snaga_ks_min)}%`)
            ) as SQL);
        }

        // --- Broj sedišta ---
        if (p.broj_sedista_min) conditions.push(sql`NULLIF(${ads.attributes}->>'seats', '')::int >= ${Number(p.broj_sedista_min)}` as SQL);
        if (p.broj_sedista_max) conditions.push(sql`NULLIF(${ads.attributes}->>'seats', '')::int <= ${Number(p.broj_sedista_max)}` as SQL);

        // --- Sigurnost (niz) ---
        if (Array.isArray(p.sigurnost) && p.sigurnost.length > 0) {
            for (const item of p.sigurnost) {
                conditions.push(sql`${ads.attributes}->'safety' @> ${JSON.stringify([item])}::jsonb` as SQL);
            }
        }

        // --- Oprema (niz) ---
        if (Array.isArray(p.oprema) && p.oprema.length > 0) {
            for (const item of p.oprema) {
                conditions.push(sql`${ads.attributes}->'equipment' @> ${JSON.stringify([item])}::jsonb` as SQL);
            }
        }

        // --- Dodatne informacije (niz) ---
        if (Array.isArray(p.extra_info) && p.extra_info.length > 0) {
            for (const item of p.extra_info) {
                conditions.push(sql`${ads.attributes}->'extra-info' @> ${JSON.stringify([item])}::jsonb` as SQL);
            }
        }

        // --- Tekstualna pretraga po marka/model/kljucne_reci ---
        const searchTerms = [p.marka, p.model, p.kljucne_reci].filter(Boolean);
        if (searchTerms.length > 0) {
            const textConditions: SQL[] = [];
            for (const term of searchTerms) {
                textConditions.push(or(
                    ilike(ads.title, `%${term}%`),
                    ilike(ads.description, `%${term}%`),
                    ilike(ads.category, `%${term}%`),
                    ilike(ads.city, `%${term}%`)
                ) as SQL);
            }
            if (textConditions.length > 0) {
                conditions.push(and(...textConditions) as SQL);
            }
        }

        try {
            const results = await db
                .select({
                    id: ads.id,
                    title: ads.title,
                    price: ads.price,
                    currency: ads.currency,
                    city: ads.city,
                    images: ads.images,
                    createdAt: ads.createdAt,
                    isPriceOnRequest: ads.isPriceOnRequest,
                    isReserved: ads.isReserved,
                })
                .from(ads)
                .where(and(...conditions))
                .limit(10);

            return results.map(ad => ({
                ...ad,
                link: `/ad/${ad.id}`,
            }));
        } catch (err) {
            console.error("[AIController] ❌ DB Error:", err);
            return [];
        }
    }

    public async generateFinalStream(messages: any[], onFinish: (fullText: string, toolInvocations?: any[]) => Promise<void>) {
        const latestUserMsg = messages[messages.length - 1]?.content || "";
        const msgLower = latestUserMsg.toLowerCase().trim();
        const pozdravi = ["cao", "ćao", "zdravo", "hello", "hi", "pozdrav", "ej", "hej", "dobar dan", "dobro jutro", "dobro veče"];

        let params;
        let isGreeting = (messages.length === 1 && msgLower.length < 10 && pozdravi.some(p => msgLower.includes(p)));

        if (isGreeting) {
            params = { tip_upita: "greeting" };
        } else {
            params = await this.extractFilterParams(messages);
            if (params.tip_upita === "greeting") isGreeting = true;
        }

        // Prazni rezultati po defaultu
        let dbResults: any[] = [];

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
        const geminiMessages: any[] = messages.slice(-10).map((m: any) => ({
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
                } else {
                    const bliski = params.bliski_modeli?.length > 0
                        ? `Predloži alternativne modele poput: ${params.bliski_modeli.join(", ")}.`
                        : "Predloži da korisnik proširi pretragu ili ukloni neke filtere.";
                    contextText = `\n\n[SISTEMSKA INFORMACIJA: Izvršena je pretraga baze, ali nije pronađen nijedan oglas koji odgovara parametrima. Obavesti korisnika o tome na prirodan način. ${bliski}]`;
                }
            } else if (isGreeting) {
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
                let toolInvocations: any[] = [];
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
                } catch (err: any) {
                    console.error("[AIController] ❌ Stream error:", err.message);
                } finally {
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
