import HelpLayout from "@/components/HelpLayout";

export default function SearchAdsFiltersPage() {
    return (
        <HelpLayout pageTitle="Korišćenje filtera pretrage" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste koristili filtere,<br />
                            na mobilnom telefonu kliknite na dugme <span className="text-[#6366f1] font-bold">Filteri</span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Ovo dugme se nalazi na dva mesta: u gornjem levom uglu (ispod polja za pretragu) i na dnu ekrana u samoj sredini.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste koristili filtere,<br />
                            na desktopu se svi dostupni filteri nalaze sa leve strane ekrana.
                        </p>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
