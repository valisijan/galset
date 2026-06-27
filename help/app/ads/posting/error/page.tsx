import HelpLayout from "@/components/HelpLayout";

export default function AdsPostingErrorPage() {
    return (
        <HelpLayout pageTitle="Greška prilikom objavljivanja oglasa" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>
                            Ukoliko naiđete na problem prilikom pokušaja da objavite oglas, najčešće se radi o nekom od sledećih razloga:
                        </p>

                        <p>
                            <strong>1. Nepopunjena obavezna polja:</strong> Proverite da li ste popunili sva polja označena kao obavezna (npr. naslov, cena, kategorija, država i grad). Sistem neće dozvoliti objavljivanje dok svi ključni podaci ne budu uneti.
                        </p>

                        <p>
                            <strong>2. Problemi sa internet konekcijom:</strong> Slaba ili nestabilna internet veza može dovesti do prekida slanja podataka ka serveru, naročito ako otpremate veći broj slika visoke rezolucije.
                        </p>

                        <p>
                            <strong>3. Veličina ili format slika:</strong> Uverite se da vaše slike ne prelaze limit od 5 MB po slici i da su u nekom od podržanih formata (JPG, PNG, WEBP).
                        </p>

                        <p>
                            Ukoliko ste proverili sve navedeno i greška se i dalje pojavljuje, preporučujemo da osvežite stranicu ili pokušate ponovo za nekoliko minuta. Naš tim stalno radi na unapređenju stabilnosti sistema kako bi vaš proces oglašavanja bio što lakši.
                        </p>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
