import HelpLayout from "@/components/HelpLayout";
import { MoreHorizontal, UserX } from 'lucide-react';

export default function BlockUserHowToPage() {
    return (
        <HelpLayout pageTitle="Kako blokirati korisnika?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste blokirali drugog korisnika,<br />
                            posetite njegov profil, a zatim u gornjem desnom uglu kliknite na tri tačke <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><MoreHorizontal className="w-5 h-5" /></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Iz menija koji se pojavi izaberite opciju <span className="inline-flex items-center gap-1 font-bold text-red-600 whitespace-nowrap align-middle"><UserX className="w-5 h-5" /> <span className="mt-0.5">Blokiraj korisnika</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            U prozoru za potvrdu ponovo kliknite na <span className="text-red-600 font-bold">Blokiraj</span> kako biste završili akciju.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste blokirali drugog korisnika,<br />
                            idite na profil tog korisnika i kliknite na dugme sa tri tačke <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><MoreHorizontal className="w-5 h-5" /></span> koje se nalazi pored dugmeta za praćenje.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Odaberite <span className="inline-flex items-center gap-1 font-bold text-red-600 whitespace-nowrap align-middle"><UserX className="w-5 h-5" /> <span className="mt-0.5">Blokiraj korisnika</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Potvrdite akciju klikom na <span className="text-red-600 font-bold">Blokiraj</span> u prozoru koji se pojavi.
                        </p>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
