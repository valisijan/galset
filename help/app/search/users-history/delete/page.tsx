import HelpLayout from "@/components/HelpLayout";
import { X } from 'lucide-react';

export default function SearchUsersHistoryDeletePage() {
    return (
        <HelpLayout pageTitle="Kako obrisati istoriju pretrage korisnika?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    <div className="space-y-2">
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste obrisali istoriju pretrage korisnika,<br />
                            u polju za pretragu, kada vam se prikaže lista prethodnih pretraga, kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><X className="w-5 h-5" /></span> ikonicu koja se nalazi sa desne strane svake stavke.
                        </p>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
