import HelpLayout from "@/components/HelpLayout";
import { Settings, UserX } from 'lucide-react';

export default function ViewBlockedUsersPage() {
    return (
        <HelpLayout pageTitle="Kako videti listu blokiranih korisnika?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste videli listu korisnika koje ste blokirali,<br />
                            u donjem desnom uglu ekrana kliknite na vašu profilnu sliku, zatim kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Settings className="w-5 h-5" /> <span className="mt-0.5">Podešavanja</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Pronađite i kliknite na opciju <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><UserX className="w-5 h-5" /> <span className="mt-0.5">Blokirani korisnici</span></span>. Tu će vam se prikazati lista svih korisnika koje ste ranije blokirali.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste videli listu blokiranih korisnika,<br />
                            u donjem levom uglu ekrana kliknite na vašu profilnu sliku, a zatim izaberite <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Settings className="w-5 h-5" /> <span className="mt-0.5">Podešavanja</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Zatim kliknite na opciju <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><UserX className="w-5 h-5" /> <span className="mt-0.5">Blokirani korisnici</span></span> kako biste videli i upravljali vašom listom.
                        </p>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
