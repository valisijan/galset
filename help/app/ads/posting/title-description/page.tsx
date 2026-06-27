import HelpLayout from "@/components/HelpLayout";

export default function AdsTitleDescriptionPage() {
    return (
        <HelpLayout pageTitle="Pisanje naslova i opisa oglasa" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <section className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pravila za dobar naslov</h3>
                            <p>
                                Naslov je prva stvar koju kupci vide. Da bi vaš oglas bio pregledan i privlačan, pratite ova osnovna pravila:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-2">
                                <li>Broj telefona ostavite u predviđenom polju za kontakt, nikako u naslovu.</li>
                                <li>Izbegavajte pisanje celog naslova velikim slovima, jer to otežava čitanje i izgleda neprofesionalno.</li>
                                <li>Naslov treba da bude jasan i konkretan. Maksimalna dozvoljena dužina je 50 karaktera.</li>
                                <li>Nemojte koristiti previše znakova uzvika ili simbola koji skreću pažnju na pogrešan način.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Saveti za kvalitetan opis</h3>
                            <p>
                                Dobar opis prodaje proizvod. Trudite se da budete što detaljniji:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-2">
                                <li>Navedite sve važne karakteristike i stanje predmeta.</li>
                                <li>Budite iskreni o eventualnim oštećenjima ili tragovima korišćenja.</li>
                                <li>Koristite pasuse kako bi tekst bio lakši za čitanje.</li>
                                <li>Izbegavajte kopiranje opisa sa drugih sajtova; napišite ga svojim rečima.</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
