import HelpLayout from "@/components/HelpLayout";
import { Sparkles } from 'lucide-react';

export default function AIStartPage() {
    return (
        <HelpLayout pageTitle="Kako započeti razgovor?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste započeli razgovor sa Galset AI,<br />
                            u gornjem levom uglu ekrana kliknite na <Sparkles className="inline-block w-5 h-5 mx-1 text-[#6366f1] mb-1" /> ikonicu.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste započeli razgovor sa Galset AI,<br />
                            sa leve strane ekrana kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Sparkles className="w-5 h-5" /> <span className="mt-0.5">Galset AI</span></span>.
                        </p>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
