import HelpLayout from "@/components/HelpLayout";
import { User } from 'lucide-react';

export default function CreateAccountPage() {
    return (
        <HelpLayout pageTitle="Kako napraviti nalog?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-10">

                    {/* Registracija preko Email-a */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Kreiranje naloga sa email adresom</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            U gornjem levom uglu ekrana kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><User className="w-5 h-5" /> <span className="mt-0.5">Prijava</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Unesite vašu email adresu i kliknite na dugme <span className="text-[#6366f1] font-bold">Nastavi</span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            U sledećem koraku unesite lozinku, vaše puno ime, korisničko ime, državu i datum rođenja, a zatim kliknite na <span className="text-[#6366f1] font-bold">Nastavi</span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Na vašu email adresu će stići 6-cifreni verifikacioni kod koji važi kratko vreme. Unesite kod i kliknite na <span className="text-[#6366f1] font-bold">Nastavi</span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 italic">
                            Nakon ovoga ste uspešno registrovani i možete početi sa korišćenjem platforme.
                        </p>
                    </div>

                    {/* Registracija preko Google-a */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Kreiranje naloga sa Google nalogom</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Kliknite na dugme <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><User className="w-5 h-5" /> <span className="mt-0.5">Prijava</span></span>, a zatim izaberite opciju <span className="text-[#6366f1] font-bold">Nastavi sa Google-om</span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Izaberite željeni Google nalog sa kojim želite da se povežete i pratite uputstva za potvrdu prijave. Vaš Galset nalog će automatski biti kreiran.
                        </p>
                    </div>

                    {/* Registracija preko Facebook-a */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Kreiranje naloga sa Facebook nalogom</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><User className="w-5 h-5" /> <span className="mt-0.5">Prijava</span></span>, a zatim na opciju <span className="text-[#6366f1] font-bold">Nastavi sa Facebook-om</span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Potvrdite pristup podacima na vašem Facebook profilu i vaš nalog će biti spreman za korišćenje u par sekundi.
                        </p>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
