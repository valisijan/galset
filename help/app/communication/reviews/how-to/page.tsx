import HelpLayout from "@/components/HelpLayout";

export default function HowToReviewPage() {
    return (
        <HelpLayout pageTitle="Kako oceniti korisnika?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste ocenili korisnika,<br />
                            posetite profil tog korisnika. Na vrhu stranice, desno od njegove profilne slike, kliknite na broj koji označava njegove ocene.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Kliknite na <span className="text-[#6366f1] font-bold">Oceni</span>. U prozoru koji se otvori izaberite ocenu od 1 do 5 zvezdica, po želji unesite opis saradnje i kliknite na <span className="text-[#6366f1] font-bold">Oceni</span>.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste ocenili korisnika,<br />
                            posetite profil tog korisnika. Na vrhu stranice, desno od njegove profilne slike, kliknite na broj koji označava njegove ocene.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Kliknite na <span className="text-[#6366f1] font-bold">Oceni</span>. U prozoru koji se otvori izaberite ocenu od 1 do 5 zvezdica, po želji unesite opis saradnje i kliknite na <span className="text-[#6366f1] font-bold">Oceni</span>.
                        </p>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
