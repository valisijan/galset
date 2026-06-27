import HelpLayout from "@/components/HelpLayout";
import { Menu, MoreVertical, Trash2 } from 'lucide-react';

export default function AIHistoryDeletePage() {
    return (
        <HelpLayout pageTitle="Kako obrisati istoriju razgovora?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste obrisali istoriju razgovora,<br />
                            kliknite na <Menu className="inline-block w-5 h-5 mx-1 text-[#6366f1] mb-1" /> ikonicu menija u gornjem levom uglu ekrana.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Zatim iz menija koji vam se otvori kliknite na <MoreVertical className="inline-block w-5 h-5 mx-1 text-[#6366f1] mb-1" /> ikonicu pored razgovora koji želite da obrišete.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Izaberite opciju <span className="inline-flex items-center gap-1 text-red-600 font-medium align-bottom"><Trash2 className="w-4 h-4" /> Obriši</span>, a zatim u prozoru koji se pojavi potvrdite brisanje klikom na crveni tekst <span className="text-red-600 font-medium">Obriši</span>.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste obrisali istoriju razgovora,<br />
                            kliknite na <Menu className="inline-block w-5 h-5 mx-1 text-[#6366f1] mb-1" /> ikonicu menija u gornjem levom uglu ekrana.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Zatim iz menija koji vam se otvori kliknite na <MoreVertical className="inline-block w-5 h-5 mx-1 text-[#6366f1] mb-1" /> ikonicu pored željenog razgovora.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Izaberite opciju <span className="inline-flex items-center gap-1 text-red-600 font-medium align-bottom"><Trash2 className="w-4 h-4" /> Obriši</span>, a zatim u prozoru koji se pojavi potvrdite brisanje klikom na crveni tekst <span className="text-red-600 font-medium">Obriši</span>.
                        </p>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
