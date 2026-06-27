import HelpLayout from "@/components/HelpLayout";
import { User } from 'lucide-react';

export default function LoginPage() {
    return (
        <HelpLayout pageTitle="Kako se prijaviti na nalog?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-10">

                    {/* Prijava preko Email-a ili Korisničkog imena */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Prijava sa email adresom ili korisničkim imenom</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            U gornjem levom uglu ekrana kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><User className="w-5 h-5" /> <span className="mt-0.5">Prijava</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Unesite vašu email adresu i kliknite na <span className="text-[#6366f1] font-bold">Nastavi</span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Zatim unesite vašu lozinku i kliknite na <span className="text-[#6366f1] font-bold">Prijavi se</span>.
                        </p>
                    </div>

                    {/* Prijava preko Google-a */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Prijava sa Google nalogom</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><User className="w-5 h-5" /> <span className="mt-0.5">Prijava</span></span>, a zatim izaberite opciju <span className="text-[#6366f1] font-bold">Nastavi sa Google-om</span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Izaberite vaš Google nalog i potvrdite prijavu.
                        </p>
                    </div>

                    {/* Prijava preko Facebook-a */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Prijava sa Facebook nalogom</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><User className="w-5 h-5" /> <span className="mt-0.5">Prijava</span></span>, a zatim na opciju <span className="text-[#6366f1] font-bold">Nastavi sa Facebook-om</span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Potvrdite prijavu preko vašeg Facebook profila.
                        </p>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
