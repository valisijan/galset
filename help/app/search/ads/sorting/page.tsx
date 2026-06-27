import HelpLayout from "@/components/HelpLayout";

export default function SearchAdsSortingPage() {
    return (
        <HelpLayout pageTitle="Sortiranje rezultata pretrage" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Mobilni pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Mobilni pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste sortirali oglase,<br />
                            na mobilnom telefonu kliknite na dugme za sortiranje koje se nalazi desno, odmah ispod polja za pretragu.
                        </p>
                    </div>

                    {/* Desktop pregledač */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Desktop pregledač</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste sortirali oglase,<br />
                            na desktopu kliknite na dugme za sortiranje koje se nalazi sa desne strane pored polja za pretragu.
                        </p>
                    </div>

                    {/* Opcije sortiranja */}
                    <div className="pt-6 space-y-4 text-gray-700 dark:text-gray-300">
                        <h4 className="font-bold text-[#6366f1]">Dostupne opcije sortiranja:</h4>
                        <div className="space-y-4 ml-2">
                            <p><strong>Najnovije</strong> – prikazuje oglase prema datumu objavljivanja, od najnovijih ka starijim.</p>
                            <p><strong>Jeftinije</strong> – sortira oglase po ceni, počevši od najniže ka najvišoj ceni.</p>
                            <p><strong>Skuplje</strong> – sortira oglase po ceni, počevši od najviše ka najnižoj ceni.</p>
                        </div>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
