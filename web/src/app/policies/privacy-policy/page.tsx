import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Politika privatnosti - Galset",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-bg-1 text-text-main p-6 md:p-12 font-sans leading-relaxed transition-colors duration-300">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold mb-4 text-center">Politika privatnosti</h1>
                <p className="text-center opacity-80 mb-10">Poslednja izmena: Maj 17, 2026</p>

                <p className="mb-6 text-left">
                    Dobrodošli na Galset. Vaša privatnost je naš prioritet i svesni smo odgovornosti koju nosi poverenje koje nam ukazujete deljenjem svojih podataka. Ova Politika privatnosti kreirana je sa ciljem da vam na potpuno transparentan i razumljiv način pruži uvid u to koje informacije prikupljamo, kako ih obrađujemo, na koji način osiguravamo njihovu zaštitu i koja su vaša zakonska prava kao korisnika naše platforme.
                </p>

                <p className="mb-12 text-left">
                    Naša filozofija je jednostavna: prikupljamo isključivo podatke neophodne za vrhunsko funkcionisanje platforme, primenjujemo savremene sigurnosne standarde za njihovo čuvanje i garantujemo da vaše lične informacije nikada nećemo prodavati trećim licima. Korišćenjem Galset platforme, potvrđujete da ste upoznati i saglasni sa praksama opisanim u ovom dokumentu.
                </p>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">1. Vrste podataka koje prikupljamo i način obrade</h2>
                    <p>Galset prikuplja minimalnu količinu podataka neophodnu za sigurno i nesmetano funkcionisanje platforme:</p>
                    <ul className="list-disc ml-6 mt-3 space-y-2">
                        <li><strong>Podaci za nalog:</strong> Prilikom registracije prikupljamo vašu e-mail adresu, korisničko ime, puno ime, datum rođenja i državu. Vaša lozinka se čuva isključivo u enkriptovanom obliku i niko, uključujući administratore Galseta, nema pristup njoj.</li>
                        <li><strong>Opcioni profilni podaci:</strong> Korisnici mogu, po sopstvenoj želji, dodati broj telefona, grad i adresu. Ovi podaci služe isključivo za olakšavanje komunikacije sa potencijalnim kupcima i izgradnju poverenja unutar zajednice.</li>
                        <li><strong>Multimedijalni sadržaj (Slike):</strong> Fotografije koje otpremate uz oglase ili kao profilnu sliku čuvaju se na sigurnim eksternim serverima. Galset primenjuje automatsku zaštitu privatnosti tako što prilikom obrade slika uklanja sve EXIF metapodatke, uključujući GPS lokaciju gde je fotografija napravljena.</li>
                        <li><strong>Tehnički podaci o uređaju:</strong> Automatski beležimo informacije o tipu uređaja (npr. model telefona ili operativni sistem) i IP adresu. Ovi podaci se koriste isključivo za upravljanje aktivnim sesijama, sprečavanje zloupotreba i zaštitu vašeg naloga od neovlašćenog pristupa.</li>
                    </ul>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">2. Svrha i način korišćenja prikupljenih podataka</h2>
                    <p>Vaše podatke koristimo na odgovoran način, isključivo u sledeće svrhe:</p>
                    <ul className="list-disc ml-6 mt-3 space-y-2">
                        <li><strong>Omogućavanje osnovnih funkcija:</strong> Vaša e-mail adresa i lozinka su neophodni ključevi za pristup vašem nalogu. Podatak o datumu rođenja koristimo radi zakonske usklađenosti (provera starosne granice 13+).</li>
                        <li><strong>Sistemska komunikacija:</strong> E-mail koristimo isključivo za važne servisne informacije: potvrdu registracije, kodove za dvofaktorsku autentifikaciju (2FA), resetovanje lozinke i obaveštenja o statusu vaših oglasa ili uplata. Galset ne praktikuje slanje neželjenih marketinških e-mailova.</li>
                        <li><strong>Personalizacija i lokalizacija:</strong> Podatke o državi i gradu koristimo kako bismo vam automatski prikazali oglase koji su vam geografski najbliži, čime proces kupoprodaje činimo bržim i lakšim.</li>
                        <li><strong>Bezbednost i integritet sesija:</strong> Podaci o vašoj IP adresi i tipu uređaja čuvaju se direktno u našoj bazi podataka. To nam omogućava da vam pružimo uvid u aktivne sesije i detektujemo sumnjive pokušaje prijave sa nepoznatih lokacija ili uređaja, štiteći tako vaš nalog od krađe.</li>
                        <li><strong>Korisnička podrška:</strong> Slanjem upita putem kontakt forme, dajete nam saglasnost da vaše podatke koristimo isključivo u svrhu rešavanja vašeg specifičnog zahteva ili pružanja tehničke podrške vezane za rad platforme.</li>
                    </ul>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">3. Upravljanje podacima i pravo na zaborav</h2>
                    <ul className="list-disc ml-6 mt-3 space-y-2">
                        <li><strong>Potpuna kontrola nad profilom:</strong> Korisnik ima pravo da u svakom trenutku pregleda, izmeni ili ažurira sve svoje lične podatke direktno putem panela sa podešavanjima naloga na Platformi.</li>
                        <li><strong>Trenutno ažuriranje:</strong> Galset primenjuje politiku "prepisivanja podataka". To znači da kada izmenite podatak na svom profilu, novi podatak trajno zamenjuje stari u našem aktivnom sistemu. Mi ne skladištimo baze sa istorijom vaših prethodnih podataka, čime osiguravamo da se u svakom trenutku obrađuju samo najnovije informacije koje ste nam dali.</li>
                        <li><strong>Privatnost komunikacije putem kontakt forme:</strong> Podaci koje pošaljete preko kontakt forme (ime i e-mail adresa) koriste se isključivo za odgovor na vaš konkretan upit. Ovi podaci se šalju direktno na naš službeni e-mail server i ne arhiviraju se u bazi podataka sajta, čime se minimizuje rizik od neovlašćenog pristupa vašim kontakt informacijama.</li>
                    </ul>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">4. Deljenje podataka sa trećim licima</h2>
                    <p>Galset ne prodaje, ne iznajmljuje i ne deli vaše lične podatke sa trećim licima u marketinške svrhe. Vaši podaci se dele isključivo u sledećim, strogo definisanim slučajevima:</p>
                    <ul className="list-disc ml-6 mt-3 space-y-2">
                        <li><strong>Procesuiranje plaćanja:</strong> Za transakcije na Platformi koristimo eksternog procesora plaćanja. Tokom kupovine kredita, određeni podaci (poput e-mail adrese i identifikatora korisnika) se prosleđuju isključivo radi realizacije uplate. Vaši podaci o platnim karticama obrađuju se direktno na sigurnim serverima procesora i nikada ne prolaze kroz servere Galset platforme, niti im mi imamo pristup.</li>
                        <li><strong>Zakonska obaveza i bezbednost:</strong> Galset će vaše lične podatke (poput IP adrese ili podataka o nalogu) otkriti trećim licima (policija, sud, tužilaštvo) isključivo ako smo na to zakonski primorani zvaničnim nalogom nadležnih organa Republike Srbije, u cilju sprečavanja prevara, ilegalnih aktivnosti ili zaštite bezbednosti naših korisnika.</li>
                        <li><strong>Tehnički provajderi:</strong> Određeni anonimizovani tehnički podaci mogu biti obrađeni od strane naših infrastrukturnih partnera (npr. server hosting ili servisi za skladištenje slika) isključivo u svrhu stabilnog rada Platforme, bez mogućnosti identifikacije pojedinačnog korisnika.</li>
                    </ul>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">5. Deaktivacija i trajno brisanje korisničkog naloga</h2>
                    <ul className="list-disc ml-6 mt-3 space-y-2">
                        <li><strong>Pravo na samostalno brisanje:</strong> Svaki korisnik ima pravo da u bilo kom trenutku inicira brisanje svog naloga direktno kroz podešavanja profila na Galset platformi.</li>
                        <li><strong>Period mirovanja:</strong> Nakon što pokrenete proces brisanja, vaš nalog ulazi u status "mirovanja" koji traje 30 dana. Tokom ovog perioda vaš profil i oglasi više nisu vidljivi drugim korisnicima, ali se podaci čuvaju u našoj bazi kao mera zaštite od slučajnog brisanja ili neovlašćenog pristupa.</li>
                        <li><strong>Trajno i nepovratno brisanje:</strong> Po isteku perioda od 30 dana, sistem će automatski, trajno i nepovratno obrisati sve vaše lične podatke, oglase i istoriju aktivnosti sa naših servera. Nakon ovog procesa, oporavak naloga više nije moguć.</li>
                        <li><strong>Izuzetak od brisanja:</strong> Galset može zadržati određene anonimizovane podatke o transakcijama isključivo radi usklađenosti sa poreskim i finansijskim zakonima, ali ti podaci više neće biti povezani sa vašim ličnim identitetom.</li>
                    </ul>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">6. Izmene Politike privatnosti</h2>
                    <p>Galset zadržava pravo da povremeno ažurira ovu Politiku privatnosti. Sve izmene postaju važeće objavljivanjem na ovoj stranici. Preporučujemo korisnicima da povremeno provere ovu stranicu kako bi bili informisani o načinu na koji štitimo njihove podatke.</p>
                </section>
            </div>
        </div>
    );
}
