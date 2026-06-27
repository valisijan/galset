import HelpLayout from "@/components/HelpLayout";

export default function AILimitsPage() {
    return (
        <HelpLayout pageTitle="Ograničenje AI modela" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>
                            Važno je napomenuti da je Galset AI pomoćnik specijalizovan isključivo za pretragu i pronalaženje oglasa. AI pomoćnik trenutno nema mogućnost postavljanja novih oglasa na platformu, već služi kao tvoj alat za najbržu filtraciju postojeće baze.
                        </p>

                        <p>
                            AI pomoćnik je još uvek u fazi razvoja. Iako se trudimo da bude nepogrešiv, veštačka inteligencija ponekad može generisati neprecizne odgovore ili pogrešno protumačiti kompleksne zahteve. Uvek savetujemo da dodatno proverite ključne detalje u samom oglasu.
                        </p>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
