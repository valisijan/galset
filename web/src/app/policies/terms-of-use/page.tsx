import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Uslovi korišćenja - Galset",
};

export default function TermsOfUsePage() {
    return (
        <div className="min-h-screen bg-bg-1 text-text-main p-6 md:p-12 font-sans leading-relaxed transition-colors duration-300">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold mb-4 text-center">Uslovi korišćenja</h1>
                <p className="text-center opacity-80 mb-10">Poslednja izmena: Maj 17, 2026</p>

                <p className="mb-6 text-left">
                    Dobrodošli na Galset, inovativnu digitalnu platformu za oglašavanje. Galset je osmišljen kao siguran, moderan i efikasan ekosistem koji povezuje prodavce i kupce, omogućavajući vam vrhunsku vidljivost vaših proizvoda i usluga.
                </p>

                <p className="mb-6 text-left">
                    Pristupanjem platformi, registracijom naloga ili korišćenjem bilo koje funkcionalnosti na Galset.com, potvrđujete da ste u potpunosti pročitali, razumeli i prihvatili Uslove korišćenja naše platforme. Ovi uslovi predstavljaju obavezujući pravni ugovor između vas (korisnika) i Galset platforme.
                </p>

                <p className="mb-12 text-left">
                    Ukoliko se ne slažete sa bilo kojom odredbom ovih pravila, molimo vas da odmah prekinete korišćenje Platforme. Nastavak korišćenja sajta smatra se vašom neopozivom saglasnošću sa svim navedenim stavkama. Galset zadržava pravo da u bilo kom trenutku, bez prethodne najave, izmeni ove uslove kako bi osigurala usklađenost sa zakonskim regulativama i unapredila korisničko iskustvo                </p>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">1. Pravo korišćenja i registracija korisnika</h2>
                    <ul className="list-disc ml-6 mt-3 space-y-2">
                        <li><strong>Fizička i pravna lica:</strong> Platforma je dostupna svim fizičkim licima (pojedincima) i pravnim licima (firmama/preduzetnicima) koji žele da oglase svoje proizvode ili usluge u skladu sa zakonom.</li>
                        <li><strong>Starosna granica:</strong> Pristup i registracija su dozvoljeni isključivo osobama koje imaju najmanje 13 godina. Korisnici mlađi od 18 godina (maloletnici) mogu koristiti Platformu isključivo uz nadzor i saglasnost roditelja ili zakonskog staratelja, koji u tom slučaju prihvata punu odgovornost za sve aktivnosti maloletnika na sajtu.</li>
                        <li><strong>Tačnost podataka:</strong> Prilikom registracije, korisnik je dužan da unese tačne i istinite podatke. Strogo je zabranjeno lažno predstavljanje, korišćenje tuđeg imena ili otvaranje naloga u ime trećih lica bez njihovog izričitog ovlašćenja.</li>
                        <li><strong>Bezbednost naloga:</strong> Korisnik je isključivo odgovoran za čuvanje poverljivosti svoje lozinke i za sve aktivnosti koje se dese pod njegovim nalogom. U slučaju sumnje na krađu identiteta ili neovlašćenog korišćenje naloga, korisnik je dužan da odmah obavesti podršku Galset platforme.</li>
                        <li><strong>Višestruki nalozi:</strong> Svaki korisnik ima pravo na jedan nalog. Otvaranje više naloga radi zloupotrebe besplatnih oglasa, promocija ili zaobilaženja kazni rezultiraće trajnom blokadom svih povezanih naloga.</li>
                    </ul>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">2. Restrikcije i zabranjeni sadržaj</h2>
                    <p className="mb-3">Galset primenjuje politiku nulte tolerancije prema ilegalnim i štetnim aktivnostima. Strogo je zabranjeno postavljanje oglasa koji sadrže:</p>
                    <ul className="list-disc ml-6 space-y-2">
                        <li><strong>Ilegalne supstance:</strong> Droga, narkotika, psihotropne supstance, kao i oprema namenjena za njihovu proizvodnju ili konzumaciju.</li>
                        <li><strong>Oružje i opasne materije:</strong> Vatreno oružje, municija, eksplozivi, kao i bilo koji predmeti čiji je promet ograničen zakonom Republike Srbije. Sportska oprema (npr. airsoft, luk i strela) je dozvoljena isključivo u skladu sa zakonskim propisima.</li>
                        <li><strong>Sadržaj za odrasle:</strong> Pornografija, eksplicitni materijali (NSFW), seksualni predmeti ili bilo koji oblik seksualnih usluga.</li>
                        <li><strong>Ukradena roba i falsifikati:</strong> Prodaja predmeta nad kojima nemate vlasništvo, kao i prodaja falsifikovane (lažne) brendirane robe koja krši prava intelektualne svojine.</li>
                        <li><strong>Digitalna piraterija:</strong> Zabranjena je prodaja "crack-ovanih" ili hakovanih softvera, igrica, digitalnih naloga (Netflix, Spotify, Youtube premium, itd.), kao i bilo kog digitalnog sadržaja koji krši autorska prava.</li>
                        <li><strong>Finansijske usluge i prevare:</strong> Nuđenje kredita, pozajmica, trgovina kriptovalutama ili bilo koji oblik finansijskog inženjeringa.</li>
                        <li><strong>Opasni materijali:</strong> Materijali preuzeti sa "Dark Web-a", opasne hemikalije, biološki materijali ili bilo šta što ugrožava javnu bezbednost.</li>
                        <li><strong>Zloupotreba platforme:</strong> Zabranjeno je kreiranje višestrukih naloga, dupliranje istih oglasa, korišćenje automatizovanih botova za postavljanje oglasa ili namerno manipulisanje sistemom ocena.</li>
                    </ul>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">3. Odricanje od odgovornosti i posredovanje u trgovini</h2>
                    <ul className="list-disc ml-6 mt-3 space-y-2">
                        <li><strong>Uloga Platforme:</strong> Galset deluje isključivo kao pasivan posrednik i digitalni oglasni prostor koji povezuje prodavce i kupce. Galset nije vlasnik, prodavac, niti zastupnik za predmete i usluge koji se oglašavaju na platformi.</li>
                        <li><strong>Bez garancije za sadržaj:</strong> Galset ne vrši prethodnu proveru fizičkog stanja, kvaliteta niti ispravnosti oglašenih predmeta. Korisnici sami snose potpunu odgovornost za istinitost opisa oglasa, kvalitet i stanje predmeta koji oglašavaju.</li>
                        <li><strong>Rizik trgovine:</strong> Svaka transakcija, plaćanje ili razmena robe obavlja se direktno između kupca i prodavca. Galset ne učestvuje u tim ugovorima i ne snosi nikakvu pravnu niti finansijsku odgovornost za eventualne sporove, prevare, štetu ili nezadovoljstvo realizovanom kupoprodajom.</li>
                        <li><strong>Saveti za bezbednost:</strong> Korisnicima se savetuje da pre svake uplate ili slanja robe detaljno provere profile i ocene drugih korisnika. Preporučujemo lično preuzimanje robe kad god je to moguće ili korišćenje proverenih kurirskih službi sa opcijom provere paketa pre plaćanja.</li>
                    </ul>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">4. Standardi zajednice i komunikacija</h2>
                    <ul className="list-disc ml-6 mt-3 space-y-2">
                        <li><strong>Kulturna komunikacija:</strong> Svaki vid komunikacije na Platformi (poruke, komentari, ocene) mora biti u duhu uzajamnog poštovanja. Strogo je zabranjeno korišćenje psovki, uvreda, govora mržnje, pretnji ili bilo kog oblika uznemiravanja. Galset zadržava pravo da bez obrazloženja ukloni vulgarni sadržaj i onemogući komunikaciju ili blokira nalog korisnika koji krši pravila komunikacije.</li>
                        <li><strong>Objektivnost ocenjivanja:</strong> Ocene moraju biti zasnovane na stvarnom iskustvu saradnje. Zabranjeno je ostavljanje lažnih pozitivnih ocena radi boljeg rangiranja na platformi, kao i namerno ostavljanje negativnih ocena bez opravdanog razloga.</li>
                        <li><strong>Zabrana iznuđivanja i ucena:</strong> Strogo je zabranjeno korišćenje sistema ocenjivanja kao sredstva ucene ili prisile (npr. pretnja negativnom ocenom kako bi se prodavac primorao na nižu cenu ili dodatne ustupke). Takvo ponašanje povlači trajnu blokadu naloga.</li>
                        <li><strong>Politika protiv spama:</strong> Zabranjeno je slanje neželjenih reklamnih poruka, masovnih upita koji nisu u vezi sa predmetom oglasa ili bilo koji vid uznemiravanja korisnika kroz privatne poruke.</li>
                        <li><strong>Integritet prijava:</strong> Sistem za prijavu oglasa i korisnika služi za čišćenje platforme od zabranjenog sadržaja, lažnih oglasa i profila i drugih oblika zloupotrebe platforme. Zloupotreba ovog sistema radi uklanjanja oglasa konkurencije ili korisničkih profila iz čiste obesti biće sankcionisana.</li>
                    </ul>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">5. Plaćanje, digitalni krediti i politika povraćaja sredstava</h2>
                    <p>Sistem plaćanja na Galset platformi je trenutno u razvoju i biće uskoro dostupan korisnicima. Galset ne čuva podatke o platnim karticama korisnika.</p>
                    <ul className="list-disc ml-6 mt-3 space-y-2">
                        <li><strong>Namena i korišćenje kredita:</strong> Uplatom sredstava, korisnik dobija digitalne kredite koji služe isključivo za aktivaciju promotivnih alata na Galsetu (npr. isticanje oglasa, obnova, itd.). Krediti su vezani za korisnički nalog, nisu prenosivi na druge korisnike i nemaju rok trajanja. Krediti se ne mogu zameniti za pravi novac niti povući sa Platforme.</li>
                        <li><strong>Pravo na povlačenje (Right of Withdrawal):</strong> Shodno međunarodnim propisima o digitalnim uslugama, korisnik se izričito saglašava da kupovinom kredita dobija pristup digitalnom sadržaju odmah nakon uplate. Samim tim, korisnik potvrđuje da gubi pravo na odustanak od kupovine i povraćaj novca (Right of Withdrawal) čim proces isporuke kredita na nalog započne. Sve kupovine su finalne.</li>
                        <li><strong>Oslobađanje od odgovornosti za transakcije robe:</strong> Galset ne učestvuje u razmeni novca između kupaca i prodavaca za oglašene predmete. Galset je isključivo odgovoran za isporuku kupljenih kredita na nalog, a ne za ishod trgovine između korisnika.</li>
                    </ul>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">6. Privatnost, bezbednost i zaštita podataka</h2>
                    <ul className="list-disc ml-6 mt-3 space-y-2">
                        <li><strong>Svrha prikupljanja podataka:</strong> Galset prikuplja samo one podatke koji su neophodni za funkcionisanje vašeg naloga i pružanje usluga oglašavanja. Vaši podaci se koriste isključivo u svrhu poboljšanja korisničkog iskustva i unutrašnje administracije Platforme.</li>
                        <li><strong>Stroga poverljivost:</strong> Galset se obavezuje da vaše lične podatke neće prodavati, iznajmljivati niti deliti sa trećim licima u marketinške svrhe.</li>
                        <li><strong>Saradnja sa nadležnim organima:</strong> U skladu sa važećim zakonima Republike Srbije, Galset će lične podatke korisnika dostaviti isključivo na zvaničan, pisani zahtev nadležnih državnih organa (MUP, tužilaštvo, sud) uz postojanje validnog zakonskog naloga, u cilju suzbijanja kriminalnih radnji ili prevara.</li>
                        <li><strong>Sigurnost komunikacije:</strong> Svi podaci poslati ka serveru zaštićeni su modernim enkripcionim protokolima (SSL/TLS), čime se osigurava da vaša komunikacija sa Platformom ostane privatna i bezbedna.</li>
                    </ul>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">7. Dostupnost Platforme i tehnička odgovornost</h2>
                    <ul className="list-disc ml-6 mt-3 space-y-2">
                        <li><strong>Neprekidnost usluge:</strong> Galset ulaže maksimalne napore da obezbedi stabilan rad platforme 24 sata dnevno, 365 dana u godini. Ipak, zbog tehničke prirode interneta, ne možemo garantovati apsolutnu dostupnost bez ikakvih prekida.</li>
                        <li><strong>Ograničenje odgovornosti:</strong> Galset ne snosi odgovornost za privremenu nedostupnost sajta uzrokovanu kvarovima na serverima, problemima kod internet provajdera, hakerskim napadima (DDoS), višom silom ili redovnim održavanjem sistema.</li>
                        <li><strong>Politika nadoknade:</strong> U slučaju kraćih tehničkih prekida rada, Galset nije u obavezi da vrši refundaciju ili produženje plaćenih promocija. Ukoliko prekid potraje duže od 24 časa, Galset će po sopstvenom nahođenju, a u cilju očuvanja fer odnosa, razmotriti mogućnost produženja trajanja aktivnih promocija za period trajanja zastoja.</li>
                    </ul>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">8. Eksterni linkovi i treća lica</h2>
                    <ul className="list-disc ml-6 mt-3 space-y-2">
                        <li><strong>Dozvoljeni linkovi:</strong> Korisnici mogu u okviru opisa svog oglasa postaviti linkovi ka svojim zvaničnim profilima na društvenim mrežama (Instagram, Facebook, itd.) ili ka sopstvenim internet prezentacijama, pod uslovom da su ti linkovi direktno povezani sa predmetom prodaje ili brendom prodavca.</li>
                        <li><strong>Zabrana štetnog sadržaja:</strong> Strogo je zabranjeno postavljanje linkova koji vode ka sajtovima sa ilegalnim sadržajem, piratskim softverom, pornografijom, kockanjem ili stranicama koje služe za "phishing" (krađu podataka) i širenje malvera.</li>
                        <li><strong>Odricanje od odgovornosti:</strong> Galset nema kontrolu nad sadržajem na eksternim sajtovima i ne snosi nikakvu odgovornost za štetu nastalu posetom tim stranicama. Klikom na eksterni link, korisnik napušta Galset platformu na sopstveni rizik.</li>
                        <li><strong>Pravo na uklanjanje:</strong> Galset zadržava diskreciono pravo da bez prethodnog upozorenja ukloni bilo koji link za koji proceni da je sumnjiv, neadekvatan ili da narušava bezbednost i reputaciju Platforme.</li>
                    </ul>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">9. Prava, ovlašćenja i intelektualna svojina Galset platforme</h2>
                    <ul className="list-disc ml-6 mt-3 space-y-2">
                        <li><strong>Pravo na moderaciju i sankcije:</strong> Galset zadržava diskreciono pravo da privremeno ili trajno suspenduje, ograniči ili obriše bilo koji korisnički nalog koji krši ove Uslove korišćenja, bez prethodne najave.</li>
                        <li><strong>Odbijanje i uklanjanje sadržaja:</strong> Zadržavamo pravo da, bez posebnog obrazloženja, odbijemo objavu ili uklonimo bilo koji oglas, sliku ili komentar ukoliko smatramo da ne odgovaraju tehničkim standardima, etičkim normama ili brend vrednostima Galset platforme.</li>
                        <li><strong>Licenca za korišćenje sadržaja:</strong> Postavljanjem fotografija i opisa oglasa, korisnik Galsetu daje neisključivo, besplatno i trajno pravo (licencu) da taj sadržaj koristi u svrhe promocije, marketinga i reklamiranja Platforme na društvenim mrežama, pretraživačima i drugim medijima.</li>
                        <li><strong>Autorska prava platforme:</strong> Sav softverski kod, dizajn, logotip i brend identitet su isključivo vlasništvo Galseta. Svako neovlašćeno kopiranje ili korišćenje elemenata sajta bez naše pismene dozvole biće zakonski procesuirano.</li>
                        <li><strong>Ažuriranje Uslova:</strong> Galset zadržava pravo izmene ovih Uslova u bilo kom trenutku. Sve izmene stupaju na snagu momentom objavljivanja na ovoj stranici. Kontinuirano korišćenje Platforme nakon promena smatra se vašim prihvatanjem novih Uslova.</li>

                    </ul>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">10. Cene i porezi</h2>
                    <ul className="list-disc ml-6 mt-3 space-y-2">
                        <li><strong>Valuta i transakcije:</strong> Sve cene kredita na Galset Platformi su izražene u evrima (EUR). Konverziju u lokalnu valutu vrši banka izdavalac kartice prema svom zvaničnom kursu.</li>
                        <li><strong>Porezi i PDV (VAT):</strong> Tokom procesa plaćanja može biti obračunat porez na dodatu vrednost (PDV/VAT) u skladu sa poreskim zakonima države iz koje korisnik vrši uplatu. Konačan iznos biće transparentno prikazan pre finalne potvrde kupovine.</li>
                        <li><strong>Pravo na izmenu cena:</strong> Galset zadržava diskreciono pravo da u bilo kom trenutku izmeni cene kredita, paketa ili pojedinačnih promotivnih usluga (poput isticanja oglasa, obnove i slično). Nove cene stupaju na snagu momentom objave na Platformi ili u okviru korisničkog panela za dopunu kredita.</li>
                        <li><strong>Promotivne akcije i bonusi:</strong> Galset može povremeno nuditi bonuse na dopunu kredita ili promotivne kodove. Uslovi tih akcija su privremeni i Galset zadržava pravo da ih povuče ili izmeni bez prethodne najave.</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
