import HelpLayout from "@/components/HelpLayout";
import { Menu } from 'lucide-react';

export default function AIHistoryContinuePage() {
    return (
        <HelpLayout pageTitle="Kako nastaviti razgovor sa AI?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste nastavili prethodni razgovor,<br />
                            kliknite na <Menu className="inline-block w-5 h-5 mx-1 text-[#6366f1] mb-1" /> ikonicu menija u gornjem levom uglu ekrana.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Zatim iz liste koja se otvori jednostavno kliknite na naslov razgovora koji želite da nastavite.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste nastavili prethodni razgovor,<br />
                            kliknite na <Menu className="inline-block w-5 h-5 mx-1 text-[#6366f1] mb-1" /> ikonicu menija u gornjem levom uglu ekrana.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Iz menija sa leve strane izaberite i kliknite na razgovor na koji želite da se vratite.
                        </p>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
