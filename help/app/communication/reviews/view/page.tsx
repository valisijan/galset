import HelpLayout from "@/components/HelpLayout";

export default function ViewUserReviewsPage() {
    return (
        <HelpLayout pageTitle="Kako pregledati ocene korisnika?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste pregledali ocene drugog korisnika,<br />
                            posetite profil tog korisnika. Na vrhu stranice, desno od njegove profilne slike, kliknite na broj koji označava njegove ocene.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Nakon toga, otvoriće se stranica sa prikazom svih ocena koje je taj korisnik dobio.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste pregledali ocene drugog korisnika,<br />
                            posetite profil tog korisnika. Na vrhu stranice, desno od njegove profilne slike, kliknite na broj koji označava njegove ocene.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Nakon toga, otvoriće se stranica sa prikazom svih ocena koje je taj korisnik dobio.
                        </p>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
