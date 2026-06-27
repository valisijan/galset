import HelpLayout from "@/components/HelpLayout";

export default function ViewFollowersPage() {
    return (
        <HelpLayout pageTitle="Kako pregledati listu korisnika koji me prate?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste pregledali listu korisnika koji vas prate,<br />
                            u donjem desnom uglu ekrana kliknite na vašu profilnu sliku, zatim na vrhu kliknite na <span className="text-[#6366f1] font-bold">Pogledaj svoj profil</span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Zatim, kliknite na broj vaših pratioca kako biste videli kompletnu listu korisnika.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste pregledali listu korisnika koji vas prate,<br />
                            u donjem levom uglu ekrana kliknite na vašu profilnu sliku, zatim iz prozora koji se otvori kliknite na <span className="text-[#6366f1] font-bold">Moj profil</span>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Zatim, kliknite na broj vaših pratioca kako biste videli kompletnu listu korisnika.
                        </p>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
