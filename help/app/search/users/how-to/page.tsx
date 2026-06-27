import HelpLayout from "@/components/HelpLayout";
import { Search } from 'lucide-react';

export default function SearchUsersHowToPage() {
    return (
        <HelpLayout pageTitle="Kako pretraživati korisnike?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste pretražili korisnike,<br />
                            na dnu ekrana kliknite na <Search className="inline-block w-6 h-6 mx-1 text-[#6366f1] mb-1" /> , a zatim u gornjem delu ekrana (ispod polja za pretragu) izaberite opciju <span className="text-[#6366f1] font-bold">Korisnici</span>.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste pretražili korisnike,<br />
                            u levom meniju kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Search className="w-5 h-5" /> <span className="mt-0.5">Pretraga</span></span>, a zatim na vrhu stranice izaberite opciju <span className="text-[#6366f1] font-bold">Korisnici</span>.
                        </p>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
