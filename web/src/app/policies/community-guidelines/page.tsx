import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Smernice zajednice - Galset",
};

export default function CommunityGuidelinesPage() {
    return (
        <div className="min-h-screen bg-bg-1 text-text-main p-6 md:p-12 font-sans leading-relaxed transition-colors duration-300">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold mb-4 text-center">Smernice zajednice</h1>
                <p className="text-center opacity-80 mb-10">Poslednja izmena: Maj 17, 2026</p>

                <p className="mb-6 text-left">
                    Dobrodošli na Galset. Naš cilj je da izgradimo sigurnu, pouzdanu i kvalitetnu zajednicu u kojoj korisnici mogu bezbedno da kupuju, prodaju i komuniciraju. Ove Smernice zajednice definišu pravila ponašanja, vrste dozvoljenog sadržaja i mere koje Galset može preduzeti radi zaštite platforme i korisnika.
                </p>

                <p className="mb-12 text-left">
                    Korišćenjem Galset platforme prihvatate obavezu poštovanja svih pravila navedenih u ovom dokumentu.
                </p>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">1. Osnovna pravila zajednice</h2>
                    <p className="mb-4">
                        Galset je otvorena platforma za objavljivanje oglasa, usluga, digitalnih proizvoda i drugih vrsta sadržaja. Od svih korisnika očekujemo odgovorno, pošteno i zakonito ponašanje.
                    </p>
                    <p>
                        Na platformi nije dozvoljeno:
                    </p>
                    <ul className="list-disc ml-6 mt-4 space-y-2">
                        <li>objavljivanje lažnih ili obmanjujućih oglasa</li>
                        <li>prevara korisnika ili pokušaj prevare</li>
                        <li>spamovanje i masovno slanje poruka</li>
                        <li>uznemiravanje, vređanje ili pretnje drugim korisnicima</li>
                        <li>govor mržnje i diskriminacija</li>
                        <li>lažno predstavljanje drugih osoba ili kompanija</li>
                        <li>korišćenje botova, skripti ili automatizovanih sistema za zloupotrebu platforme</li>
                        <li>pokušaj krađe naloga ili phishing aktivnosti</li>
                        <li>deljenje zlonamernih linkova ili fajlova</li>
                        <li>manipulacija pregledima, ocenama ili statistikama oglasa</li>
                    </ul>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">2. Zabranjeni sadržaj i oglasi</h2>
                    <p className="mb-4">
                        Galset ne dozvoljava objavljivanje sadržaja koji je nezakonit, opasan ili štetan po korisnike i zajednicu.
                    </p>
                    <p>
                        Strogo je zabranjeno objavljivanje oglasa koji uključuju:
                    </p>
                    <ul className="list-disc ml-6 mt-4 space-y-2">
                        <li>pornografiju i eksplicitni seksualni sadržaj</li>
                        <li>vatreno oružje, municiju i opasno oružje</li>
                        <li>drogu i ilegalne supstance</li>
                        <li>hakovane naloge, ukradene podatke ili ilegalni digitalni sadržaj</li>
                        <li>pirateriju, crackovane programe i nelegalne licence</li>
                        <li>scam i phishing sadržaj</li>
                        <li>falsifikovane dokumente</li>
                        <li>sadržaj koji promoviše nasilje ili ilegalne aktivnosti</li>
                    </ul>
                    <p className="mt-4">
                        Galset zadržava pravo da ukloni svaki sadržaj koji procenimo kao štetan, rizičan ili neprimeren, čak i ako nije eksplicitno naveden u ovim smernicama.
                    </p>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">3. Pravila za oglase</h2>
                    <p className="mb-4">
                        Svi oglasi na Galset platformi moraju biti jasni, iskreni i napisani na način koji ne dovodi korisnike u zabludu.
                    </p>
                    <p className="mb-4">
                        Nije dozvoljeno:
                    </p>
                    <ul className="list-disc ml-6 mt-4 space-y-2">
                        <li>postavljanje lažnih cena</li>
                        <li>korišćenje cena poput „1€“, „123“, „dogovor“ ili sličnih vrednosti radi privlačenja pregleda</li>
                        <li>postavljanje duplih oglasa</li>
                        <li>clickbait naslovi i obmanjujući opisi</li>
                        <li>korišćenje nepovezanih ili lažnih slika</li>
                        <li>spamovanje kategorija velikim brojem identičnih oglasa</li>
                        <li>objavljivanje oglasa koji nemaju realnu svrhu prodaje ili usluge</li>
                    </ul>
                    <p className="mt-4">
                        Korisnik je odgovoran za tačnost svih informacija koje objavi u okviru oglasa.
                    </p>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">4. Automatska moderacija i pregled sadržaja</h2>
                    <p className="mb-4">
                        Galset koristi automatske sisteme za proveru sadržaja pre objavljivanja oglasa kako bi sprečio objavljivanje zabranjenog ili rizičnog sadržaja.
                    </p>
                    <p>
                        U određenim slučajevima, sadržaj ipak može proći automatsku proveru. Ukoliko naknadno utvrdimo da oglas krši pravila platforme, Galset može:
                    </p>
                    <ul className="list-disc ml-6 mt-4 space-y-2">
                        <li>ukloniti oglas</li>
                        <li>ograničiti određene funkcije naloga</li>
                        <li>privremeno suspendovati korisnika</li>
                        <li>trajno zabraniti korišćenje platforme</li>
                    </ul>
                    <p className="mt-4">
                        Radi zaštite zajednice, Galset zadržava pravo uklanjanja sadržaja bez prethodnog upozorenja.
                    </p>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">5. Sistem upozorenja i kazni</h2>
                    <p className="mb-4">
                        Naš cilj nije trenutno kažnjavanje korisnika, već održavanje zdrave i sigurne zajednice. U većini slučajeva pokušavamo da korisniku damo priliku da ispravi ponašanje pre trajnih mera.
                    </p>
                    <p className="mb-4">
                        Kazne zavise od težine i učestalosti prekršaja i mogu uključivati:
                    </p>
                    <ul className="list-disc ml-6 mt-4 space-y-2">
                        <li>upozorenje</li>
                        <li>privremenu zabranu postavljanja oglasa</li>
                        <li>privremenu zabranu slanja poruka</li>
                        <li>ograničenje određenih funkcija naloga</li>
                        <li>trajnu zabranu pojedinih funkcija</li>
                        <li>trajni ban naloga</li>
                    </ul>
                    <p className="mt-4">
                        Ponovljeni prekršaji mogu rezultirati strožim kaznama i trajnim uklanjanjem sa platforme.
                    </p>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">6. Privatna komunikacija između korisnika</h2>
                    <p>
                        Galset omogućava privatnu komunikaciju između korisnika putem internog sistema poruka.
                    </p>
                    <p>
                        Privatne poruke su dostupne isključivo učesnicima razgovora i zaštićene su sigurnosnim mehanizmima platforme. Ipak, korisnicima savetujemo dodatni oprez prilikom deljenja:
                    </p>
                    <ul className="list-disc ml-6 mt-4 space-y-2">
                        <li>brojeva telefona</li>
                        <li>adresa</li>
                        <li>lozinki</li>
                        <li>podataka za plaćanje</li>
                        <li>ličnih ili poverljivih informacija</li>
                    </ul>
                    <p className="mt-4">
                        Zabranjeno je korišćenje platforme za:
                    </p>
                    <ul className="list-disc ml-6 mt-4 space-y-2">
                        <li>spam</li>
                        <li>uznemiravanje</li>
                        <li>prevare</li>
                        <li>phishing</li>
                        <li>slanje zlonamernih linkova ili sadržaja</li>
                    </ul>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">7. Bezbedna kupovina i odgovornost korisnika</h2>
                    <p className="mb-4">
                        Galset predstavlja platformu koja povezuje korisnike radi kupovine, prodaje i pružanja usluga. Galset nije direktni učesnik u transakcijama između korisnika.
                    </p>
                    <p className="mb-4">
                        Korisnici samostalno dogovaraju:
                    </p>
                    <ul className="list-disc ml-6 mt-4 space-y-2">
                        <li>način komunikacije</li>
                        <li>uslove saradnje</li>
                        <li>način plaćanja</li>
                        <li>dostavu ili preuzimanje proizvoda</li>
                    </ul>
                    <p className="mt-4 mb-4">
                        Preporučujemo korisnicima da budu oprezni prilikom sklapanja dogovora i da izbegavaju sumnjive ponude ili korisnike.
                    </p>
                    <p>
                        Roditelji i staratelji odgovorni su za aktivnosti korisnika mlađih od 18 godina koji koriste platformu.
                    </p>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">8. Prijavljivanje sadržaja i korisnika</h2>
                    <p className="mb-4">
                        Korisnici mogu prijaviti oglase, poruke ili profile za koje smatraju da krše pravila platforme.
                    </p>
                    <p className="mb-4">
                        Svaka prijava može sadržati:
                    </p>
                    <ul className="list-disc ml-6 mt-4 space-y-2">
                        <li>razlog prijave</li>
                        <li>dodatni opis problema</li>
                    </ul>
                    <p className="mt-4">
                        Galset zadržava pravo da samostalno proceni da li je došlo do kršenja pravila i koje mere će biti preduzete.
                    </p>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">9. Zaštita privatnosti i sigurnosti</h2>
                    <p className="mb-4">
                        Zabranjeno je javno objavljivanje ili deljenje tuđih privatnih podataka bez dozvole korisnika.
                    </p>
                    <ul className="list-disc ml-6 mt-4 space-y-2">
                        <li>brojeve telefona</li>
                        <li>adrese</li>
                        <li>lozinke</li>
                        <li>podatke za plaćanje</li>
                        <li>privatne razgovore</li>
                        <li>druge poverljive informacije</li>
                    </ul>
                    <p className="mt-4">
                        Svaki pokušaj zloupotrebe privatnih podataka može rezultirati trajnim uklanjanjem sa platforme i prijavom nadležnim organima.
                    </p>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">10. Izmene smernica zajednice</h2>
                    <p className="mb-4">
                        Galset zadržava pravo da povremeno ažurira ove Smernice zajednice radi zaštite korisnika, unapređenja platforme i usklađivanja sa zakonskim propisima.
                    </p>
                    <p>
                        Sve izmene postaju važeće objavljivanjem nove verzije na ovoj stranici. Korisnicima preporučujemo da povremeno provere smernice kako bi ostali informisani o pravilima korišćenja platforme.
                    </p>
                </section>
            </div>
        </div>
    );
}
