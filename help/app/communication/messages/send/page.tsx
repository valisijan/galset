import HelpLayout from "@/components/HelpLayout";
import { MessageCircle, Send } from 'lucide-react';

export default function SendMessagePage() {
    return (
        <HelpLayout pageTitle="Kako poslati poruku?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste poslali poruku drugom korisniku,<br />
                            u donjem meniju kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><MessageCircle className="w-5 h-5" /> <span className="mt-0.5">Poruke</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Otvorite željeni razgovor, zatim unesite vaš tekst u polje za unos poruke na dnu ekrana i kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Send className="w-5 h-5" /></span>.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste poslali poruku,<br />
                            izaberite opciju <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><MessageCircle className="w-5 h-5" /> <span className="mt-0.5">Poruke</span></span> sa leve strane ekrana.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Otvorite željeni razgovor, zatim unesite vaš tekst u polje za unos poruke na dnu ekrana i kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Send className="w-5 h-5" /></span> ili kliknite <span className="font-bold">Enter</span> na tastaturi.
                        </p>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
