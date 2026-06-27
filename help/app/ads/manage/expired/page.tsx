import HelpLayout from "@/components/HelpLayout";
import { Menu } from 'lucide-react';

export default function AdsManageExpiredPage() {
    return (
        <HelpLayout pageTitle="Gde se nalaze moji istekli oglasi?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste pronašli istekle oglase,<br />
                            u donjem desnom uglu ekrana kliknite na vašu profilnu sliku, zatim kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Menu className="w-5 h-5" /> <span className="mt-0.5">Moji oglasi</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Izaberite sekciju <span className="text-[#6366f1] font-bold">Istekli</span> koja se nalazi na vrhu ekrana.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste pronašli istekle oglase,<br />
                            u levom uglu ekrana kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Menu className="w-5 h-5" /> <span className="mt-0.5">Moji oglasi</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Kliknite na karticu <span className="text-[#6366f1] font-bold">Istekli</span> na vrhu liste vaših oglasa.
                        </p>
                    </div>

                    {/* Dodatne informacije */}
                    <div className="pt-6 space-y-4 text-gray-700 dark:text-gray-300">
                        <p>
                            Vaši oglasi se u ovoj sekciji nalaze <strong>5 dana</strong> nakon što isteknu (nakon 30 dana aktivnog trajanja).
                        </p>
                        <p>
                            Nakon tih 5 dana, oglas se <strong>trajno briše</strong> sa platforme. Svi podaci vezani za taj oglas, uključujući preglede, praćenja i statistike, biće zauvek izgubljeni i ne mogu se povratiti.
                        </p>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
