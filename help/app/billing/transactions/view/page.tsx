import HelpLayout from "@/components/HelpLayout";
import { Wallet } from 'lucide-react';

export default function ViewTransactionsPage() {
    return (
        <HelpLayout pageTitle="Kako pregledati istoriju transakcija?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste pregledali vaše transakcije,<br />
                            u donjem desnom uglu ekrana kliknite na vašu profilnu sliku, zatim kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Wallet className="w-5 h-5" /> <span className="mt-0.5">Novčanik</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Na dnu stranice kliknite na <span className="text-[#6366f1] font-bold">Prikaži sve transakcije</span> kako biste videli kompletnu listu.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste pregledali vaše transakcije,<br />
                            sa leve strane ekrana kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Wallet className="w-5 h-5" /> <span className="mt-0.5">Novčanik</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Na dnu stranice kliknite na <span className="text-[#6366f1] font-bold">Prikaži sve transakcije</span> kako biste videli kompletnu listu.
                        </p>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
