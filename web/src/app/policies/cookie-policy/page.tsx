import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Politika kolačića - Galset",
};

export default function CookiePolicyPage() {
    return (
        <div className="min-h-screen bg-bg-1 text-text-main p-6 md:p-12 font-sans leading-relaxed transition-colors duration-300">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold mb-4 text-center">Politika kolačića</h1>
                <p className="text-center opacity-80 mb-10">Poslednja izmena: Maj 17, 2026</p>

                <p className="mb-6 text-left">
                    Dobrodošli na Galset. Ova Politika kolačića objašnjava na koji način koristimo kolačiće i slične tehnologije kako bismo omogućili sigurno, stabilno i funkcionalno korišćenje naše platforme. Naš pristup privatnosti je jednostavan - koristimo minimalan broj kolačića neophodnih za rad sajta, zaštitu korisničkih naloga i unapređenje korisničkog iskustva.
                </p>

                <p className="mb-12 text-left">
                    Korišćenjem Galset platforme potvrđujete da ste upoznati sa praksama opisanim u ovoj Politici kolačića.
                </p>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">1. Šta su kolačići?</h2>
                    <p className="mb-4 text-left">
                        Kolačići (cookies) predstavljaju male tekstualne datoteke koje se čuvaju na vašem uređaju prilikom posete sajtu. Njihova svrha je da omoguće pravilno funkcionisanje platforme, pamćenje određenih podešavanja i unapređenje korisničkog iskustva.
                    </p>

                    <p>
                        Pored klasičnih kolačića, Galset koristi i tehnologije poput Local Storage i serverskih sesija radi bezbednijeg i efikasnijeg rada platforme.
                    </p>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">2. Koje vrste kolačića koristimo</h2>
                    <p>
                        Galset koristi isključivo ograničen broj kolačića i tehnologija koje su direktno povezane sa osnovnim funkcionisanjem sajta.
                    </p>

                    <h3 className="text-xl font-bold mb-4 mt-8">Neophodni kolačići</h3>
                    <p>
                        Ovi kolačići omogućavaju osnovne funkcije platforme i ne mogu biti onemogućeni tokom korišćenja sajta.
                    </p>
                    <ul className="list-disc ml-6 mt-3 mb-4 space-y-2">
                        <li>prijavu i održavanje aktivne korisničke sesije</li>
                        <li>bezbedno prepoznavanje prijavljenih korisnika</li>
                        <li>zaštitu naloga i sprečavanje zloupotreba</li>
                        <li>pamćenje izabrane teme interfejsa</li>
                        <li>upravljanje sigurnosnim sesijama između uređaja</li>
                    </ul>
                    <p>
                        Bez ovih kolačića Galset ne bi mogao pravilno da funkcioniše.
                    </p>

                    <h3 className="text-xl font-bold mb-4 mt-8">Kolačići i lokalno skladištenje za korisničko iskustvo</h3>
                    <p>
                        Galset koristi Local Storage i slične tehnologije radi poboljšanja iskustva korišćenja platforme.
                    </p>
                    <ul className="list-disc ml-6 mt-3 mb-4 space-y-2">
                        <li>storiju pretrage oglasa</li>
                        <li>poslednje pregledane sadržaje</li>
                        <li>zaštitu naloga i sprečavanje zloupotreba</li>
                        <li>određena lokalna podešavanja interfejsa</li>
                    </ul>
                    <p>
                        Ovi podaci se čuvaju lokalno na vašem uređaju i mogu biti obrisani direktno kroz podešavanja vašeg internet pregledača.
                    </p>

                    <h3 className="text-xl font-bold mb-4 mt-8">Analitički kolačići</h3>
                    <p>
                        Galset koristi Google Analytics radi anonimne analize saobraćaja i razumevanja načina korišćenja platforme.
                    </p>
                    <ul className="list-disc ml-6 mt-3 mb-4 space-y-2">
                        <li>broj poseta sajtu</li>
                        <li>broj pregleda stranica</li>
                        <li>osnovne informacije o uređaju i pregledaču</li>
                        <li>opšte statistike korišćenja platforme</li>
                    </ul>
                    <p>
                        Podaci se koriste isključivo za unapređenje performansi, stabilnosti i kvaliteta platforme. Galset ne koristi reklamne niti marketinške kolačiće i ne prodaje korisničke podatke trećim licima.
                    </p>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">3. Kolačići trećih strana</h2>
                    <p>
                        Određene funkcionalnosti Galset platforme oslanjaju se na spoljne servise koji mogu koristiti sopstvene kolačiće ili sigurnosne tehnologije.
                    </p>
                    <ul className="list-disc ml-6 mt-3 mb-4 space-y-2">
                        <li>Google Analytics - analitika posećenosti</li>
                        <li>Cloudflare - zaštita platforme od zloupotreba i bot napada</li>
                        <li>Leaflet / OpenStreetMap - prikaz mapa i lokacija</li>
                        <li>ImageKit - sigurna obrada i isporuka slika</li>
                        <li>Vercel - hosting i tehnička infrastruktura platforme</li>
                    </ul>
                    <p>
                        Galset nema direktnu kontrolu nad kolačićima koje koriste spoljne platforme u okviru svojih usluga.
                    </p>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">4. Upravljanje kolačićima</h2>
                    <p className="mb-4 text-left">
                        Korišćenjem Galset platforme pristajete na upotrebu neophodnih kolačića koji omogućavaju osnovno funkcionisanje sajta i sigurnost korisničkih naloga.
                    </p>

                    <p>
                        Određeni podaci poput istorije pretrage i lokalnih podešavanja mogu biti obrisani direktno kroz vaš internet pregledač ili brisanjem lokalnih podataka sajta.
                    </p>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">5. Zaštita privatnosti korisnika</h2>
                    <p>
                        Galset primenjuje princip minimalnog prikupljanja podataka. Ne koristimo kolačiće za agresivno praćenje korisnika, profilisanje ponašanja niti prikaz personalizovanih reklama.
                    </p>
                    <p className="mb-4 mt-4 text-left">
                        Naš cilj je da kolačiće koristimo isključivo u meri koja je neophodna za:
                    </p>
                    <ul className="list-disc ml-6 mt-3 mb-4 space-y-2">
                        <li>sigurnost platforme</li>
                        <li>stabilan rad sistema</li>
                        <li>zaštitu korisničkih naloga</li>
                        <li>unapređenje korisničkog iskustva</li>
                    </ul>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">6. GDPR i prava korisnika</h2>
                    <p>
                        U skladu sa važećim zakonima o zaštiti podataka i GDPR principima, korisnici imaju pravo da budu informisani o načinu korišćenja kolačića i tehnologija za skladištenje podataka.
                    </p>
                    <p className="mb-4 mt-4 text-left">
                        Korisnici takođe imaju pravo da:
                    </p>
                    <ul className="list-disc ml-6 mt-3 mb-4 space-y-2">
                        <li>zatraže informacije o obradi podataka</li>
                        <li>obrišu lokalno sačuvane podatke kroz svoj pregledač</li>
                        <li>prestanu da koriste platformu u bilo kom trenutku</li>
                        <li>zatraže trajno brisanje svog naloga u skladu sa Politikom privatnosti</li>
                    </ul>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">7. Izmene Politike kolačića</h2>
                    <p className="mb-4 text-left">
                        Galset zadržava pravo da povremeno ažurira ovu Politiku kolačića radi usklađivanja sa tehničkim, bezbednosnim ili zakonskim promenama.
                    </p>

                    <p>
                        Sve izmene postaju važeće objavljivanjem nove verzije na ovoj stranici. Korisnicima preporučujemo da povremeno provere sadržaj politike kako bi ostali informisani o načinu korišćenja kolačića i zaštite privatnosti na platformi Galset.
                    </p>
                </section>
            </div>
        </div>
    );
}
