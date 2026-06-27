import HelpLayout from "@/components/HelpLayout";

export default function HowToUseAI() {
    return (
        <HelpLayout pageTitle="Kako koristiti AI pretragu" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <section className="space-y-4 text-gray-700 dark:text-gray-300">
                    <p>
                        Korišćenje Galset AI pomoćnika je vrlo jednostavno kao dopisivanje sa prijateljem. Ne morate da razmišljate o filterima, kategorijama i komplikovanim menijima – samo recite šta vam treba.
                    </p>

                </section>

                <section className="space-y-4 text-gray-700 dark:text-gray-300">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Primeri upotrebe</h3>
                    <ul className="space-y-3 ml-4">
                        <li className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-2 h-2 mt-2 bg-gray-400 rounded-full"></div>
                            <div>
                                <span className="font-medium text-gray-900 dark:text-gray-100">Automobili:</span> "Nađi mi crni BMW do 15.000 evra u okolini Beograda."
                            </div>
                        </li>
                        <li className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-2 h-2 mt-2 bg-gray-400 rounded-full"></div>
                            <div>
                                <span className="font-medium text-gray-900 dark:text-gray-100">Tehnika:</span> "Koji telefon ima najbolju kameru u cenovnom rangu do 400 evra?"
                            </div>
                        </li>
                        <li className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-2 h-2 mt-2 bg-gray-400 rounded-full"></div>
                            <div>
                                <span className="font-medium text-gray-900 dark:text-gray-100">Logistika:</span> "Prikaži mi samo oglase gde prodavac nudi i isporuku."
                            </div>
                        </li>
                    </ul>
                </section>
            </div>
        </HelpLayout>
    );
}
