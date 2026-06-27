import HelpLayout from "@/components/HelpLayout";
import { Settings, Lock } from 'lucide-react';

export default function EditPasswordPage() {
    return (
        <HelpLayout pageTitle="Kako promeniti lozinku?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste izmenili vašu lozinku,<br />
                            u donjem desnom uglu ekrana kliknite na vašu profilnu sliku, zatim kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Settings className="w-5 h-5" /> <span className="mt-0.5">Podešavanja</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Lock className="w-5 h-5" /> <span className="mt-0.5">Bezbednost</span></span>, zatim kliknite na <span className="text-[#6366f1] font-bold">Lozinka</span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            U prozoru koji se otvori unesite vašu trenutnu i novu lozinku, a zatim kliknite na <span className="text-[#6366f1] font-bold">Primeni</span>.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste izmenili vašu lozinku,<br />
                            u donjem levom uglu ekrana kliknite na vašu profilnu sliku, zatim kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Settings className="w-5 h-5" /> <span className="mt-0.5">Podešavanja</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Kliknite na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Lock className="w-5 h-5" /> <span className="mt-0.5">Bezbednost</span></span>, zatim kliknite na <span className="text-[#6366f1] font-bold">Lozinka</span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            U prozoru koji se otvori unesite vašu trenutnu i novu lozinku, a zatim kliknite na <span className="text-[#6366f1] font-bold">Primeni</span>.
                        </p>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
