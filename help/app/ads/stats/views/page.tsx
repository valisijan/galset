import HelpLayout from "@/components/HelpLayout";
import { Menu, Eye } from 'lucide-react';

export default function AdsStatsViewsPage() {
    return (
        <HelpLayout pageTitle="Kako videti ukupan broj pregleda oglasa?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste videli statistiku vaših oglasa,<br />
                            u donjem desnom uglu ekrana kliknite na vašu profilnu sliku, zatim kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Menu className="w-5 h-5" /> <span className="mt-0.5">Moji oglasi</span></span>.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste videli statistiku vaših oglasa,<br />
                            u levom uglu ekrana kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Menu className="w-5 h-5" /> <span className="mt-0.5">Moji oglasi</span></span>.
                        </p>
                    </div>

                    <div className="pt-6 text-gray-700 dark:text-gray-300 space-y-4">
                        <p>
                            Ukupan broj pregleda vašeg oglasa možete videti u njegovom donjem desnom uglu, pored <Eye className="inline-block w-5 h-5 mx-1 text-[#6366f1] mb-1" /> ikonice.
                        </p>
                        <p>
                            Ovaj broj predstavlja koliko puta su korisnici otvorili i detaljno pregledali vaš oglas.
                        </p>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
