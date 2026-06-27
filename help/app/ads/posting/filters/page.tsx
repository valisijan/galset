import HelpLayout from "@/components/HelpLayout";

export default function AdsFiltersPage() {
    return (
        <HelpLayout pageTitle="Dodavanje filtera oglasa" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>
                            Pravilno popunjavanje filtera je jedan od najvažnijih koraka pri kreiranju oglasa. Filteri omogućavaju kupcima da brzo i lako suze pretragu i pronađu baš ono što traže.
                        </p>

                        <p>
                            Veoma je bitno da pažljivo izaberete i popunite sva ponuđena polja za filtere u vašoj kategoriji. Na taj način osiguravate da se vaš oglas pojavi u rezultatima pretrage kada neko filtrira oglase po specifičnim karakteristikama (npr. marka, model, veličina, boja ili stanje).
                        </p>

                        <p>
                            Budite precizni i unesite tačne podatke. Što više relevantnih filtera popunite, to su veće šanse da će vaš oglas biti vidljiv pravim kupcima. Oglasi bez popunjenih filtera često ostaju sakriveni duboko u rezultatima pretrage i teže se pronalaze.
                        </p>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
