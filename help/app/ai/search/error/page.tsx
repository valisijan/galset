import HelpLayout from "@/components/HelpLayout";

export default function SearchErrorPage() {
    return (
        <HelpLayout pageTitle="Greška prilikom pretrage" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>
                            Ukoliko ti se desi da AI pomoćnik prijavi sistemsku grešku ili prestane da odgovara usred razgovora, važno je da znaš da je sistem još uvek u fazi intenzivnog razvoja i testiranja. Ovakve greške se najčešće dešavaju zbog trenutnog opterećenja servera ili tehničkog ažuriranja modela.
                        </p>

                        <p>
                            Ako dođe do prekida, prvi korak je da pokušaš da započneš novi čet. Ukoliko se greška i dalje ponavlja, najbolje je da sačekaš nekoliko minuta i pokušaš ponovo. Naš tim aktivno prati sve sistemske logove i radi na tome da Galset AI uvek bude dostupan i stabilan za tvoju pretragu.
                        </p>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
