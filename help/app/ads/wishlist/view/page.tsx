import HelpLayout from "@/components/HelpLayout";
import { Heart } from 'lucide-react';

export default function AdsWishlistViewPage() {
    return (
        <HelpLayout pageTitle="Kako videti moju listu želja?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste videli vašu listu želja,<br />
                            u donjem desnom uglu ekrana kliknite na vašu profilnu sliku, zatim kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Heart className="w-5 h-5" /> <span className="mt-0.5">Lista želja</span></span>.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste videli vašu listu želja,<br />
                            kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Heart className="w-5 h-5" /> <span className="mt-0.5">Lista želja</span></span> koja se nalazi u gornjem delu ekrana.
                        </p>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
