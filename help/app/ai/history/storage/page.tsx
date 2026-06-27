import HelpLayout from "@/components/HelpLayout";
import { Menu } from 'lucide-react';

export default function AIHistoryStoragePage() {
    return (
        <HelpLayout pageTitle="Kako da vidim svoju istoriju razgovora?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste videli istoriju vaših razgovora,<br />
                            kliknite na <Menu className="inline-block w-5 h-5 mx-1 text-[#6366f1] mb-1" /> ikonicu menija u gornjem levom uglu ekrana.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Tu ćete moći da vidite celu vašu istoriju razgovora sa Galset AI pomoćnikom.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste videli istoriju vaših razgovora,<br />
                            kliknite na <Menu className="inline-block w-5 h-5 mx-1 text-[#6366f1] mb-1" /> ikonicu menija u gornjem levom uglu ekrana.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Tu ćete imati potpun pregled svih vaših prethodnih interakcija i sačuvanih upita.
                        </p>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
