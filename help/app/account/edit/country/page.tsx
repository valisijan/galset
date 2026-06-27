import HelpLayout from "@/components/HelpLayout";
import { Settings, UserPen } from 'lucide-react';

export default function EditCountryPage() {
    return (
        <HelpLayout pageTitle="Kako izmeniti državu?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste izmenili državu,<br />
                            u donjem desnom uglu ekrana kliknite na vašu profilnu sliku, zatim na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Settings className="w-5 h-5" /> <span className="mt-0.5">Podešavanja</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Izaberite opciju <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><UserPen className="w-5 h-5" /> <span className="mt-0.5">Uredi profil</span></span>, pronađite polje <span className="text-[#6366f1] font-bold">Država</span> i izaberite vašu državu iz opadajuće liste.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Nakon izbora, u prozoru koji se pojavi na dnu ekrana kliknite na dugme <span className="text-[#6366f1] font-bold">Sačuvaj</span>.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste izmenili državu,<br />
                            u donjem levom uglu ekrana kliknite na vašu profilnu sliku, zatim na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Settings className="w-5 h-5" /> <span className="mt-0.5">Podešavanja</span></span> i izaberite <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><UserPen className="w-5 h-5" /> <span className="mt-0.5">Uredi profil</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Kliknite na polje <span className="text-[#6366f1] font-bold">Država</span> i izaberite odgovarajuću državu iz liste koja će se otvoriti. Pojaviće se prozor sa potvrdom gde je potrebno da kliknete na dugme <span className="text-[#6366f1] font-bold">Sačuvaj</span>.
                        </p>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
