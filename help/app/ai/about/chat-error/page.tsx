import HelpLayout from "@/components/HelpLayout";

export default function AIChatErrorPage() {
    return (
        <HelpLayout pageTitle="Greška u AI razgovoru" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>
                            Tokom korišćenja može se desiti da AI pomoćnik prikaže oglase koji ne odgovaraju u potpunosti vašem upitu ili da dobijete sistemsku grešku u odgovoru. S obzirom na to da je model u stalnoj fazi učenja i razvoja, ovakve situacije su moguće kod kompleksnih ili nedovoljno jasnih zahteva.
                        </p>

                        <p>
                            Ako dobijete loš odgovor ili dođe do greške, preporučujemo da pokušate sa preciznije definisanim upitom. Naš tim aktivno prati rad AI pomoćnika i konstantno radi na otklanjanju tehničkih grešaka kako bi pretraga bila što preciznija i stabilnija.
                        </p>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
