"use client";

import Image from "next/image";

export default function AboutGalsetPage() {
    return (
        <div className="min-h-screen bg-bg-1 text-text-main p-6 md:p-12 font-sans leading-relaxed transition-colors duration-300">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold mb-4 text-center">O Galset platformi</h1>
                <p className="text-center opacity-80 mb-10">Budućnost oglašavanja je stigla</p>

                <p className="mb-6 text-left">
                    Galset nije samo još jedan oglasnik. Mi smo tehnološki odgovor na potrebe savremenog tržišta Srbije.
                </p>

                <p className="mb-12 text-left">
                    Galset je nastao iz jedne jednostavne ideje: da kupovina i prodaja na internetu moraju biti brže, sigurnije i pametnije. U svetu gde svi negde žure, niko nema vremena da lista stotine nebitnih oglasa. Zato smo kreirali platformu koja radi za vas.
                </p>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">Zašto smo bolji od drugih?</h2>
                    <ul className="list-disc ml-6 mt-3 space-y-2">
                        <li><strong>Pokretani Veštačkom Inteligencijom (AI):</strong> Galset koristi napredne AI algoritme koji uče iz vaših pretraga. Naš sistem ne traži samo ključne reči – on razume šta vam zaista treba. Rezultat? Dobijate najrelevantnije oglase u milisekundi, bez nepotrebnog gubljenja vremena.</li>
                        <li><strong>Jednostavnost pre svega:</strong> Verujemo da vrhunska tehnologija mora biti jednostavna za korišćenje. Bez obzira da li prodajete telefon ili tražite novi stan, naš interfejs je dizajniran da vas do cilja dovede u par klikova.</li>
                        <li><strong>Sigurnost bez kompromisa:</strong> Vaša bezbednost je naš prioritet. Kroz saradnju sa svetskim liderima u procesiranju plaćanja i primenu najmodernijih sistema zaštite podataka, Galset gradi zajednicu poverenja.</li>
                        <li><strong>Fokus na korisnika:</strong> Za razliku od zastarelih platformi, Galset sluša svoju zajednicu. Svaka naša nova funkcija, od sistema kredita do premium promocija, dizajnirana je da vama donese veći profit i bržu realizaciju.</li>
                    </ul>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">Naša Misija</h2>
                    <p className="text-left">
                        Naš cilj je jasan – postati vodeća digitalna platforma u regionu (a uskoro i globalno) koja postavlja standarde u e-trgovini. Želimo da Galset bude sinonim za fer, brzu i pametnu trgovinu.
                    </p>
                </section>

                <section className="mb-10 text-left">
                    <h2 className="text-xl font-bold mb-4">Pridružite nam se!</h2>
                    <p className="text-left">
                        Bilo da ste kupac, prodavac ili partner, Galset je mesto za vas. Registrujte se, kreirajte svoj prvi oglas i osetite razliku. Dobrodošli na Galset tamo gde budućnost oglašavanja počinje!
                    </p>
                </section>

                {/* Logo at the bottom */}
                <div className="flex justify-center mt-14 mb-4">
                    <Image
                        src="https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/logo/galset-logo-full.svg"
                        alt="Galset Logo"
                        width={220}
                        height={70}
                        className="object-contain"
                    />
                </div>
            </div>
        </div>
    );
}
