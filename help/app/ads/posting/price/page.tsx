import HelpLayout from "@/components/HelpLayout";

export default function AdsPricePage() {
    return (
        <HelpLayout pageTitle="Određivanje cene oglasa" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <section className="space-y-4">
                            <p>
                                Prilikom postavljanja oglasa, imate punu kontrolu nad tim kako će cena vašeg proizvoda biti prikazana kupcima.
                            </p>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Opcije za unos cene:</h3>
                            <ul className="list-disc list-inside space-y-3 ml-2">
                                <li>
                                    <strong>Ručni unos:</strong> Možete uneti tačan iznos koji tražite za svoj predmet.
                                </li>
                                <li>
                                    <strong>Izbor valute:</strong> Sistem vam omogućava da birate između dve valute: <strong>EUR</strong> (Evro) ili <strong>RSD</strong> (Srpski dinar).
                                </li>
                                <li>
                                    <strong>Poklanjam:</strong> Ukoliko ne želite novčanu naknadu, možete izabrati opciju "Poklanjam" i vaš oglas će biti posebno istaknut u toj kategoriji.
                                </li>
                                <li>
                                    <strong>Kontakt:</strong> Ako želite da se o ceni dogovorite direktno sa potencijalnim kupcem, možete izabrati opciju "Kontakt". U tom slučaju, umesto cene stajaće poziv da vas kupci kontaktiraju.
                                </li>
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
