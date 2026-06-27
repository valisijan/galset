import HelpLayout from "@/components/HelpLayout";
import { Heart } from 'lucide-react';

export default function AdsWishlistRemovePage() {
    return (
        <HelpLayout pageTitle="Kako ukloniti oglas iz liste želja?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste uklonili oglas iz liste želja,<br />
                            u donjem desnom uglu ekrana kliknite na vašu profilnu sliku, zatim kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Heart className="w-5 h-5" /> <span className="mt-0.5">Lista želja</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Pronađite oglas koji želite da uklonite i u njegovom gornjem desnom uglu kliknite na <Heart className="inline-block w-5 h-5 mx-1 text-[#6366f1] fill-[#6366f1] mb-1" /> ikonicu.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste uklonili oglas iz liste želja,<br />
                            kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Heart className="w-5 h-5" /> <span className="mt-0.5">Lista želja</span></span> u gornjem delu ekrana.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Na oglasu koji želite da uklonite, kliknite na <Heart className="inline-block w-5 h-5 mx-1 text-[#6366f1] fill-[#6366f1] mb-1" /> ikonicu u gornjem desnom uglu.
                        </p>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
