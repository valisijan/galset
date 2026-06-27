import HelpLayout from "@/components/HelpLayout";
import { LifeBuoy } from 'lucide-react';

export default function ReportProblemPage() {
    return (
        <HelpLayout pageTitle="Kako prijaviti tehnički problem?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste prijavili tehnički problem,<br />
                            u donjem desnom uglu ekrana kliknite na vašu profilnu sliku, a zatim na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><LifeBuoy className="w-5 h-5" /> <span className="mt-0.5">Pomoć</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Kliknite na <span className="text-[#6366f1] font-bold">Prijavite problem</span>, izaberite stranicu na kojoj imate tehnički problem i unesite detaljan opis problema, zatim kliknite na <span className="text-[#6366f1] font-bold">Prijavi</span>.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste prijavili tehnički problem,<br />
                            u donjem levom uglu ekrana kliknite na vašu profilnu sliku, a zatim iz menija koji se pojavi izaberite <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><LifeBuoy className="w-5 h-5" /> <span className="mt-0.5">Pomoć</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Kliknite na <span className="text-[#6366f1] font-bold">Prijavite problem</span>, izaberite stranicu na kojoj imate tehnički problem i unesite detaljan opis problema, zatim kliknite na <span className="text-[#6366f1] font-bold">Prijavi</span>.
                        </p>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
