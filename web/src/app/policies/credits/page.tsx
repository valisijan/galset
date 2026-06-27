import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Galset krediti",
};

export default function ServiceCreditTermsPage() {
    return (
        <div className="min-h-screen bg-bg-1 text-text-main p-6 md:p-12 font-sans leading-relaxed transition-colors duration-300">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold mb-4 text-center">Galset krediti</h1>
                <p className="text-center opacity-80 mb-10">Poslednja izmena: Maj 17, 2026</p>

                <p className="mb-6 text-left">
                    Dobrodošli na Galset Credits sistem. Galset krediti predstavljaju virtuelni oblik interne valute koja korisnicima omogućava korišćenje dodatnih funkcija i pogodnosti unutar platforme.
                </p>

                <p className="mb-12 text-left">
                    Kupovinom i korišćenjem Galset kredita potvrđujete da ste upoznati i saglasni sa pravilima navedenim u ovom dokumentu.
                </p>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">1. Šta su Galset krediti</h2>
                    <p>Galset krediti predstavljaju virtuelna sredstva namenjena isključivo za korišćenje funkcija dostupnih unutar Galset platforme.</p>
                    <p className="mt-3">Krediti se mogu koristiti za različite premium opcije i unapređenja oglasa, uključujući promocije i druge funkcionalnosti dostupne kroz zvanični cenovnik platforme.</p>
                    <p className="mt-3">Galset krediti:</p>
                    <ul className="list-disc ml-6 mt-3 space-y-2">
                        <li>nemaju stvarnu monetarnu vrednost van platforme</li>
                        <li>ne predstavljaju elektronski novac</li>
                        <li>nisu bankovni proizvod</li>
                        <li>ne mogu se koristiti van Galset platforme</li>
                    </ul>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">2. Kupovina kredita</h2>
                    <p>Kupovina kredita vrši se isključivo putem zvaničnih metoda plaćanja dostupnih na Galset platformi.</p>
                    <p className="mt-3">Kupovina kredita vrši se isključivo putem zvaničnih metoda plaćanja dostupnih na Galset platformi. Sistem plaćanja je trenutno u razvoju i biće uskoro dostupan.</p>
                    <p className="mt-3">Broj dobijenih kredita zavisi od izabranog paketa i aktuelnog cenovnika objavljenog na platformi. Galset zadržava pravo izmene cena, paketa, promocija i količine kredita bez prethodne najave.</p>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">3. Korišćenje kredita</h2>
                    <p>Galset krediti mogu se koristiti isključivo za funkcije dostupne unutar platforme.</p>
                    <p className="mt-3">To može uključivati:</p>
                    <ul className="list-disc ml-6 mt-3 space-y-2">
                        <li>promocije oglasa</li>
                        <li>dodatne opcije vidljivosti</li>
                        <li>obnovu oglasa</li>
                        <li>dodatne funkcionalnosti vezane za objavljivanje sadržaja</li>
                        <li>druge premium opcije definisane na zvaničnom cenovniku</li>
                    </ul>
                    <p className="mt-3">Detaljan pregled funkcija i cena dostupan je kroz zvanični cenovnik na platformi.</p>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">4. Trajanje kredita</h2>
                    <p>Galset krediti nemaju rok trajanja i ostaju povezani sa korisničkim nalogom dok god je nalog aktivan.</p>
                    <p className="mt-3">Krediti ostaju dostupni korisniku sve dok ih ne potroši kroz funkcionalnosti platforme.</p>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">5. Refundacije i povraćaj sredstava</h2>
                    <p>Sve kupovine Galset kredita smatraju se konačnim.</p>
                    <p className="mt-3">Nakon uspešno izvršene kupovine:</p>
                    <ul className="list-disc ml-6 mt-3 space-y-2">
                        <li>nije moguće izvršiti refundaciju</li>
                        <li>nije moguće pretvoriti kredite nazad u novac</li>
                        <li>nije moguće povući sredstva sa naloga</li>
                        <li>nije moguće zameniti kredite za gotovinu ili druge usluge</li>
                    </ul>
                    <p className="mt-3">Kupovinom kredita korisnik potvrđuje da razume prirodu virtuelnih proizvoda i pristaje na nepovratnost transakcije.</p>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">6. Prenos i trgovina kreditima</h2>
                    <p>Galset krediti su trajno vezani za nalog korisnika koji ih je kupio.</p>
                    <p className="mt-3">Nije dozvoljeno:</p>
                    <ul className="list-disc ml-6 mt-3 space-y-2">
                        <li>prebacivanje kredita drugim korisnicima</li>
                        <li>prodaja kredita van platforme</li>
                        <li>razmena kredita između naloga</li>
                        <li>korišćenje alternativnih naloga radi zloupotrebe sistema</li>
                    </ul>
                    <p className="mt-3">Svaki pokušaj manipulacije kreditnim sistemom može rezultirati ograničenjem funkcija ili trajnim banom naloga.</p>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">7. Brisanje naloga i kredita</h2>
                    <p>U slučaju trajnog brisanja korisničkog naloga, svi preostali Galset krediti biće trajno i nepovratno obrisani zajedno sa nalogom.</p>
                    <p className="mt-3">Obrisani krediti nije moguće vratiti niti preneti na drugi nalog.</p>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">8. Promocije i bonus krediti</h2>
                    <p>Galset može povremeno organizovati promotivne akcije, popuste ili dodelu bonus kredita.</p>
                    <p className="mt-3">To može uključivati:</p>
                    <ul className="list-disc ml-6 mt-3 space-y-2">
                        <li>promotivne događaje</li>
                        <li>specijalne akcije i popuste</li>
                        <li>privremene benefite za određene funkcije</li>
                    </ul>
                    <p className="mt-3">Galset zadržava pravo izmene ili ukidanja promotivnih akcija u bilo kom trenutku.</p>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">9. Vidljivost oglasa i ograničenje odgovornosti</h2>
                    <p>Korišćenje Galset kredita može povećati vidljivost oglasa i poboljšati njegovo pozicioniranje unutar platforme.</p>
                    <p className="mt-3">Ipak, Galset ne garantuje:</p>
                    <ul className="list-disc ml-6 mt-3 space-y-2">
                        <li>prodaju proizvoda ili usluge</li>
                        <li>broj pregleda oglasa</li>
                        <li>broj poruka ili kontakata</li>
                        <li>uspešnu realizaciju transakcije</li>
                        <li>zaradu ili profit korisnika</li>
                    </ul>
                    <p className="mt-3">Uspeh oglasa zavisi od više faktora uključujući kvalitet oglasa, cenu, opis, tržišnu potražnju i interesovanje drugih korisnika.</p>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">10. Zloupotreba sistema kredita</h2>
                    <p>Radi zaštite platforme i korisnika, zabranjene su sve vrste zloupotrebe kreditnog sistema.</p>
                    <p className="mt-3">To uključuje:</p>
                    <ul className="list-disc ml-6 mt-3 space-y-2">
                        <li>pokušaj manipulacije promocijama</li>
                        <li>exploit sistema</li>
                        <li>lažne kupovine ili chargeback zloupotrebe</li>
                        <li>korišćenje više naloga radi zaobilaženja ograničenja</li>
                        <li>automatizovano iskorišćavanje sistema</li>
                        <li>pokušaj neovlašćenog generisanja kredita</li>
                    </ul>
                    <p className="mt-3">Galset zadržava pravo da u slučaju zloupotrebe:</p>
                    <ul className="list-disc ml-6 mt-3 space-y-2">
                        <li>ukloni kredite</li>
                        <li>ograniči funkcije naloga</li>
                        <li>suspenduje korisnika</li>
                        <li>trajno zabrani pristup platformi</li>
                    </ul>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">11. Izmene sistema kredita</h2>
                    <p>Galset zadržava pravo da u bilo kom trenutku izmeni:</p>
                    <ul className="list-disc ml-6 mt-3 space-y-2">
                        <li>cenu kredita</li>
                        <li>dostupne pakete</li>
                        <li>funkcionalnosti koje koriste kredite</li>
                        <li>promotivne akcije</li>
                        <li>pravila korišćenja kredita</li>
                    </ul>
                    <p className="mt-3">Sve izmene postaju važeće objavljivanjem nove verzije pravila na platformi.</p>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">12. Prihvatanje uslova</h2>
                    <p>Kupovinom ili korišćenjem Galset kredita korisnik potvrđuje da:</p>
                    <ul className="list-disc ml-6 mt-3 space-y-2">
                        <li>razume prirodu virtuelnih kredita</li>
                        <li>prihvata pravila korišćenja sistema</li>
                        <li>razume da krediti nemaju stvarnu novčanu vrednost van platforme</li>
                        <li>prihvata da su kupovine konačne i nepovratne</li>
                        <li>pristaje na poštovanje svih pravila Galset platforme i Smernica zajednice.</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
