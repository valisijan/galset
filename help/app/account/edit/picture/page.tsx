import HelpLayout from "@/components/HelpLayout";
import { Settings, UserPen } from 'lucide-react';

export default function EditPicturePage() {
    return (
        <HelpLayout pageTitle="Kako izmeniti profilnu sliku?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste izmenili profilnu sliku,<br />
                            u donjem desnom uglu ekrana kliknite na vašu profilnu sliku, zatim na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Settings className="w-5 h-5" /> <span className="mt-0.5">Podešavanja</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Izaberite opciju <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><UserPen className="w-5 h-5" /> <span className="mt-0.5">Uredi profil</span></span>, a zatim u gornjem desnom uglu kliknite na dugme <span className="text-[#6366f1] font-bold">Izmeni sliku</span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            U prozoru koji se otvori, kliknite na polje u sredini da otpremite novu sliku, namestite je kako želite i kliknite na <span className="text-[#6366f1] font-bold">Primeni</span>.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste izmenili profilnu sliku,<br />
                            u donjem levom uglu ekrana kliknite na vašu profilnu sliku, zatim na <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><Settings className="w-5 h-5" /> <span className="mt-0.5">Podešavanja</span></span> i izaberite <span className="inline-flex items-center gap-1 font-bold text-[#6366f1] whitespace-nowrap align-middle"><UserPen className="w-5 h-5" /> <span className="mt-0.5">Uredi profil</span></span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Kliknite na dugme <span className="text-[#6366f1] font-bold">Izmeni sliku</span>. U novom prozoru kliknite na sredinu ili prevucite sliku sa vašeg računara.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Sliku možete zumirati točkićem miša, a pomerati je tako što ćete kliknuti na nju i vući je u željenom pravcu. Kada završite, kliknite na dugme <span className="text-[#6366f1] font-bold">Primeni</span>.
                        </p>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
