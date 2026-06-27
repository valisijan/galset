import HelpLayout from "@/components/HelpLayout";
import { Settings, HatGlasses, ShieldCheck } from 'lucide-react';

export default function CookieSettingsPage() {
    return (
        <HelpLayout pageTitle="Podešavanja kolačića" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste upravljali vašim kolačićima,<br />
                            u donjem desnom uglu ekrana kliknite na vašu profilnu sliku, zatim kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Settings className="w-5 h-5" /> <span className="mt-0.5">Podešavanja</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><HatGlasses className="w-5 h-5" /> <span className="mt-0.5">Privatnost</span></span>, a zatim izaberite opciju <span className="text-[#6366f1] font-bold">Podešavanja kolačića</span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            U prozoru koji se otvori možete aktivirati ili deaktivirati kolačiće. Neophodni kolačići su uvek uključeni radi funkcionisanja sajta. Nakon izmena kliknite na <span className="text-[#6366f1] font-bold">Primeni</span>.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste izmenili podešavanja kolačića,<br />
                            u donjem levom uglu ekrana kliknite na vašu profilnu sliku, a zatim izaberite <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Settings className="w-5 h-5" /> <span className="mt-0.5">Podešavanja</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Zatim kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><HatGlasses className="w-5 h-5" /> <span className="mt-0.5">Privatnost</span></span> i kliknite na <span className="text-[#6366f1] font-bold">Podešavanja kolačića</span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            U prozoru koji se otvori možete aktivirati ili deaktivirati kolačiće. Neophodni kolačići su uvek uključeni radi funkcionisanja sajta. Nakon izmena kliknite na <span className="text-[#6366f1] font-bold">Primeni</span>.
                        </p>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
