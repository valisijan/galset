import HelpLayout from "@/components/HelpLayout";
import { MoreVertical } from 'lucide-react';

export default function ReportUserPage() {
    return (
        <HelpLayout pageTitle="Kako prijaviti korisnika?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste prijavili korisnika koji krši pravila zajednice,<br />
                            posetite njegov profil, a zatim ispod njegove profilne slike kliknite na tri tačke <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><MoreVertical className="w-5 h-5" /></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Izaberite opciju <span className="text-red-600 font-bold">Prijavi</span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            U prozoru koji vam se otvori odaberite razlog prijave i po želji opis, zatim kliknite na <span className="text-[#6366f1] font-bold">Prijavi</span>.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste prijavili korisnika koji krši pravila zajednice,<br />
                            posetite njegov profil, a zatim sa desne strane njegove profilne slike kliknite na tri tačke <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><MoreVertical className="w-5 h-5" /></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Izaberite opciju <span className="text-red-600 font-bold">Prijavi</span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            U prozoru koji vam se otvori odaberite razlog prijave i po želji opis, zatim kliknite na <span className="text-[#6366f1] font-bold">Prijavi</span>.
                        </p>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
