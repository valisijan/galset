import HelpLayout from "@/components/HelpLayout";
import { Star } from 'lucide-react';

export default function ViewMyReviewsPage() {
    return (
        <HelpLayout pageTitle="Kako pregledati svoje ocene?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste pregledali vaše ocene,<br />
                            u donjem desnom uglu ekrana kliknite na vašu profilnu sliku, a zatim izaberite opciju <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Star className="w-5 h-5" /> <span className="mt-0.5">Ocene</span></span>.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste pregledali vaše ocene,<br />
                            sa leve strane ekrana kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Star className="w-5 h-5" /> <span className="mt-0.5">Ocene</span></span>.
                        </p>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
