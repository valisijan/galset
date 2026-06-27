import HelpLayout from "@/components/HelpLayout";

export default function UnfollowUserPage() {
    return (
        <HelpLayout pageTitle="Kako otpratiti korisnika?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste otpratili korisnika,<br />
                            posetite profil tog korisnika i kliknite na <span className="text-[#6366f1] font-bold">Pratite</span> koje se nalazi ispod njegove profilne slike.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            U prozoru koji se otvori kliknite na <span className="text-[#6366f1] font-bold">Prekini praćenje</span>.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste otpratili korisnika,<br />
                            posetite profil tog korisnika i kliknite na <span className="text-[#6366f1] font-bold">Pratite</span> koje se nalazi sa desne strane njegove profilne slike.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            U prozoru koji se otvori kliknite na <span className="text-[#6366f1] font-bold">Prekini praćenje</span>.
                        </p>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
