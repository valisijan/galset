import HelpLayout from "@/components/HelpLayout";
import { MessageCircle } from 'lucide-react';

export default function ViewMessagesPage() {
    return (
        <HelpLayout pageTitle="Kako pregledati poruke?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste pregledali vaše poruke,<br />
                            u donjem meniju na sredini ekrana kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><MessageCircle className="w-5 h-5" /> <span className="mt-0.5">Poruke</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Izaberite razgovor koji želite da otvorite i poruke će se pojaviti na ekranu.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste pregledali vaše poruke,<br />
                            sa leve strane ekrana kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><MessageCircle className="w-5 h-5" /> <span className="mt-0.5">Poruke</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Sa leve strane će se pojaviti lista svih vaših razgovora. Izaberite željeni kontakt i prepiska će se otvoriti sa desne strane.
                        </p>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
