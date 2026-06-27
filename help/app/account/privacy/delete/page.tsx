import HelpLayout from "@/components/HelpLayout";
import { Settings, HatGlasses } from 'lucide-react';

export default function DeleteAccountPage() {
    return (
        <HelpLayout pageTitle="Kako obrisati nalog?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste obrisali vaš nalog,<br />
                            u donjem desnom uglu ekrana kliknite na vašu profilnu sliku, zatim kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Settings className="w-5 h-5" /> <span className="mt-0.5">Podešavanja</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><HatGlasses className="w-5 h-5" /> <span className="mt-0.5">Privatnost</span></span>, zatim kliknite na <span className="text-red-600 font-bold">Obriši nalog</span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            U prozoru koji se otvori, štiklirajte polje za potvrdu, zatim kliknite na <span className="text-red-600 font-bold">Obriši nalog</span>.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste obrisali vaš nalog,<br />
                            u donjem levom uglu ekrana kliknite na vašu profilnu sliku, zatim kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Settings className="w-5 h-5" /> <span className="mt-0.5">Podešavanja</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><HatGlasses className="w-5 h-5" /> <span className="mt-0.5">Privatnost</span></span>, zatim kliknite na <span className="text-red-600 font-bold">Obriši nalog</span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            U prozoru koji se otvori, štiklirajte polje za potvrdu, zatim kliknite na <span className="text-red-600 font-bold">Obriši nalog</span>.
                        </p>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
