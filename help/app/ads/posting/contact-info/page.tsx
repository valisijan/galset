import HelpLayout from "@/components/HelpLayout";

export default function AdsContactInfoPage() {
    return (
        <HelpLayout pageTitle="Kontakt podaci oglasa" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>
                            Pravilni kontakt podaci su ključni za uspešnu prodaju, jer omogućavaju kupcima da vas lako kontaktiraju i daju im sigurnost prilikom kupovine.
                        </p>
                        
                        <p>
                            U okviru kontakt informacija možete uneti sledeće podatke: <strong>državu</strong>, <strong>grad</strong>, <strong>adresu</strong> i <strong>broj telefona</strong>.
                        </p>

                        <p>
                            Važno je napomenuti da su od ovih podataka obavezni samo <strong>država</strong> i <strong>grad</strong>. Polja za adresu i broj telefona su opciona i ne morate ih popunjavati ukoliko to ne želite.
                        </p>

                        <p>
                            Ipak, topla preporuka je da ostavite i broj telefona i barem približnu adresu. Oglasi sa kompletnim kontakt informacijama ulivaju mnogo veće poverenje kod korisnika i značajno ubrzavaju proces prodaje, jer kupci preferiraju direktnu komunikaciju.
                        </p>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
