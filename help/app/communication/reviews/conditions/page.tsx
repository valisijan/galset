import HelpLayout from "@/components/HelpLayout";

export default function HowToReviewPage() {
    return (
        <HelpLayout pageTitle="Uslovi za ocjenjivanje korisnika" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Pravila ocenjivanja */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Pravila i uslovi ocenjivanja</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da bismo obezbedili fer, transparentnu i bezbednu trgovinu na Galset platformi, primenjujemo stroga pravila za ostavljanje ocena. Svaka ocena mora biti zasnovana na stvarnom iskustvu i ostvarenom kontaktu.
                        </p>
                    </div>

                    {/* Ko može ostaviti ocenu */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Ko može da oceni korisnika?</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 pt-4 space-y-2">
                            <li>Možete oceniti korisnika samo ukoliko ste sa njim imali razmenu poruka na Galset platformi u vezi sa oglašenim predmetom ili uslugom.</li>
                            <li>Takođe, možete oceniti korisnika ukoliko ste uspešno realizovali kupovinu ili prodaju.</li>
                        </ul>
                    </div>

                    {/* Zabranjene aktivnosti */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Zabranjeno ponašanje</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 pt-4 space-y-2">
                            <li><strong>Veštačko ocenjivanje:</strong> Zabranjeno je ocenjivanje sopstvenih naloga (sa drugih profila) ili dogovaranje sa drugim korisnicima o lažnom ocenjivanju radi veštačkog podizanja reputacije.</li>
                            <li><strong>Ucenjivanje ocenom:</strong> Nije dozvoljeno korišćenje ocena kao sredstvo ucene ili pritiska na drugu stranu tokom pregovora.</li>
                            <li><strong>Uvredljiv sadržaj:</strong> Opis ocene ne sme da sadrži vulgarne reči, uvrede, lične napade, pretnje ili bilo koji oblik govora mržnje.</li>
                        </ul>
                    </div>

                    {/* Posledice kršenja uslova */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Posledice kršenja pravila</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Ukoliko naš tim utvrdi da je ocena ostavljena suprotno ovim uslovima, takva ocena će biti trajno uklonjena. U slučaju učestalog kršenja pravila, nalog korisnika može biti privremeno suspendovan ili trajno blokiran.
                        </p>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
