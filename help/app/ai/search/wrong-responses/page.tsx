import HelpLayout from "@/components/HelpLayout";

export default function WrongResponsesPage() {
    return (
        <HelpLayout pageTitle="AI daje pogrešne odgovore" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>
                            S obzirom na to da na razvoju AI pomoćnika radimo svakodnevno, on je još uvek u fazi učenja. Zbog toga se može desiti da ponekad dobijete oglase koji nisu ono što ste tražili ili odgovor koji nije potpuno precizan.
                        </p>

                        <p>
                            U takvim situacijama, najbolji način da dobijete ono što vam treba je da detaljnije opišete svoj zahtev. Umesto kratkih fraza, slobodno napišite više detalja o modelu, ceni ili lokaciji kako bi AI pomoćnik bolje razumeo kontekst.
                        </p>

                        <p>
                            Takođe, ako primetite da AI pomoćnik počne da greši u dužem razgovoru, preporučujemo da započnete novi razgovor. To će resetovati kontekst i omogućiti modelu da vaš sledeći upit obradi potpuno sveže i preciznije.
                        </p>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
