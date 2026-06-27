import HelpLayout from "@/components/HelpLayout";

export default function AIHistoryPrivacyPage() {
    return (
        <HelpLayout pageTitle="Privatnost podataka i bezbednost" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>
                            Vaša privatnost je naš apsolutni prioritet. Svi razgovori koje vodite sa Galset AI pomoćnikom su u potpunosti zaštićeni, kriptovani i privatni.
                        </p>

                        <p>
                            Važno je da znate da niko drugi, uključujući i zaposlene u Galset timu, nema pristup vašim privatnim četovima. Vaša istorija razgovora je isključivo vezana za vaš nalog i dostupna je samo vama nakon uspešne prijave.
                        </p>

                        <p>
                            Vaši podaci se koriste isključivo kako biste vi mogli da imate uvid u svoje prethodne pretrage i nastavite razgovore tamo gde ste stali. Mi ne delimo, ne prodajemo i ne ustupamo vaše podatke trećim stranama niti ih koristimo u svrhe oglašavanja.
                        </p>

                        <p>
                            Takođe, vi imate potpunu kontrolu nad svojom istorijom. U svakom trenutku možete obrisati pojedinačne upite ili kompletnu istoriju razgovora, čime se ti podaci trajno i nepovratno uklanjaju sa naših servera.
                        </p>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
