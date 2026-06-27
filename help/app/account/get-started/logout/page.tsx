import HelpLayout from "@/components/HelpLayout";
import { LogOut } from 'lucide-react';

export default function LogoutPage() {
    return (
        <HelpLayout pageTitle="Kako se odjaviti sa naloga?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste se odjavili sa vašeg naloga,<br />
                            u donjem desnom uglu ekrana kliknite na vašu profilnu sliku, skrolujte do samog dna i kliknite na <span className="inline-flex items-center gap-1 font-bold text-red-600 whitespace-nowrap align-middle"><LogOut className="w-5 h-5" /> <span className="mt-0.5">Odjavi se</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Zatim u prozoru koji se otvori potvrdite odjavu klikom na <span className="text-red-600 font-bold">Odjavi se</span>.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste se odjavili sa vašeg naloga,<br />
                            u donjem levom uglu ekrana kliknite na vašu profilnu sliku, a zatim iz menija izaberite <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><LogOut className="w-5 h-5" /> <span className="mt-0.5">Odjavi se</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            U prozoru koji se pojavi potvrdite akciju klikom na <span className="text-red-600 font-bold">Odjavi se</span>.
                        </p>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
