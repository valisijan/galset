import HelpLayout from "@/components/HelpLayout";
import { Plus } from 'lucide-react';

export default function AdsPostingHowToPage() {
    return (
        <HelpLayout pageTitle="Kako postaviti oglas?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste postavili oglas,<br />
                            na dnu ekrana kliknite na <Plus className="inline-block w-6 h-6 mx-1 text-[#6366f1] mb-1" /> dugme.
                        </p>
                        <div className="space-y-3 pt-2 text-gray-700 dark:text-gray-300">
                            <p>Nakon toga, proces se odvija u 3 jednostavna koraka:</p>
                            <ul className="list-decimal list-inside space-y-2 ml-2">
                                <li>Izaberite odgovarajuću <strong>kategoriju</strong> za vaš oglas.</li>
                                <li>Popunite sva polja (naslov, cena, opis, filteri i kontakt) i kliknite na <span className="text-[#6366f1] font-bold">Nastavi</span>.</li>
                                <li>Izaberite promociju vašeg oglasa, a zatim kliknite na <span className="text-[#6366f1] font-bold">Objavi</span>.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste postavili oglas,<br />
                            na levoj strani ekrana kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Plus className="w-5 h-5" /> <span className="mt-0.5">Novi oglas</span></span>.
                        </p>
                        <div className="space-y-3 pt-2 text-gray-700 dark:text-gray-300">
                            <p>Zatim prođite kroz proces u 3 koraka:</p>
                            <ul className="list-decimal list-inside space-y-2 ml-2">
                                <li>Izaberite <strong>kategoriju</strong> u koju želite da postavite oglas.</li>
                                <li>Unesite sve podatke (naslov, cenu, opis, filtere i kontakt) i kliknite na <span className="text-[#6366f1] font-bold">Nastavi</span>.</li>
                                <li>Odaberite promociju vašeg oglasa i završite proces klikom na <span className="text-[#6366f1] font-bold">Objavi</span>.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
