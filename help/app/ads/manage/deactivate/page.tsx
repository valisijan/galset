import HelpLayout from "@/components/HelpLayout";
import { Menu, MoreVertical, Power } from 'lucide-react';

export default function AdsManageDeactivatePage() {
    return (
        <HelpLayout pageTitle="Kako deaktivirati oglas?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste deaktivirali oglas,<br />
                            u donjem desnom uglu ekrana kliknite na vašu profilnu sliku, zatim kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Menu className="w-5 h-5" /> <span className="mt-0.5">Moji oglasi</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Na oglasu koji želite da deaktivirate kliknite na <MoreVertical className="inline-block w-5 h-5 mx-1 text-[#6366f1] mb-1" /> ikonicu, zatim kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Power className="w-5 h-5" /> <span className="mt-0.5">Deaktiviraj</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            U prozoru koji se otvori, potvrdite deaktivaciju klikom na <span className="text-[#6366f1] font-bold">Deaktiviraj</span>.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste deaktivirali oglas,<br />
                            u levom uglu ekrana kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Menu className="w-5 h-5" /> <span className="mt-0.5">Moji oglasi</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Zatim na željenom oglasu kliknite na <MoreVertical className="inline-block w-5 h-5 mx-1 text-[#6366f1] mb-1" /> ikonicu, pa na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Power className="w-5 h-5" /> <span className="mt-0.5">Deaktiviraj</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Potvrdite akciju u prozoru koji se pojavi klikom na <span className="text-[#6366f1] font-bold">Deaktiviraj</span>.
                        </p>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
