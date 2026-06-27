import HelpLayout from "@/components/HelpLayout";
import { Menu, Eye, Heart, MessageSquare } from 'lucide-react';

export default function AdsStatsAccessPage() {
    return (
        <HelpLayout pageTitle="Kako videti statistiku oglasa?" hideWrapper={true}>
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

                    {/* Objašnjenje ikonica */}
                    <div className="pt-6 space-y-6 text-gray-700 dark:text-gray-300">
                        <p>
                            Na svakom vašem oglasu, u donjem desnom uglu, prikazane su sledeće ikonice koje vam daju uvid u njegovu uspešnost:
                        </p>

                        <div className="space-y-4 ml-2">
                            <div className="flex items-start gap-3">
                                <Eye className="w-5 h-5 text-[#6366f1] shrink-0 mt-1" />
                                <p><strong>Pregledi:</strong> Ukupan broj korisnika koji su otvorili i detaljno pregledali vaš oglas.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <Heart className="w-5 h-5 text-[#6366f1] shrink-0 mt-1" />
                                <p><strong>Lista želja:</strong> Broj korisnika koji su dodali vaš oglas u svoju listu želja radi lakšeg praćenja.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <MessageSquare className="w-5 h-5 text-[#6366f1] shrink-0 mt-1" />
                                <p><strong>Poruke:</strong> Broj započetih četova i upita koje ste dobili direktno za taj konkretan oglas.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
