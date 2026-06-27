import HelpLayout from "@/components/HelpLayout";
import { Search } from 'lucide-react';

export default function SearchAdsHowToPage() {
    return (
        <HelpLayout pageTitle="Kako pretražiti oglase?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste pretražili oglase,<br />
                            možete koristiti polje za pretragu koje se nalazi direktno na početnoj stranici.<br />
                            Pored pretrage na početnoj, na dnu ekrana možete kliknuti na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Search className="w-5 h-5" /> <span className="mt-0.5">Pretraga</span></span>.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste pretražili oglase,<br />
                            možete koristiti polje za pretragu koje se nalazi direktno na početnoj stranici.<br />
                            Pored pretrage na početnoj, u levom uglu ekrana možete kliknuti na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Search className="w-5 h-5" /> <span className="mt-0.5">Pretraga</span></span>.
                        </p>
                    </div>

                    {/* Dodatno objašnjenje */}
                    <div className="pt-4 space-y-4 text-gray-700 dark:text-gray-300">
                        <p>
                            Otvaranjem posebne stranice za pretragu dobijate mogućnost da detaljnije pretražujete oglase koristeći napredne filtere (kategorije, lokacija, raspon cene i specifični atributi predmeta).
                        </p>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
