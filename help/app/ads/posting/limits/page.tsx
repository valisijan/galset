import HelpLayout from "@/components/HelpLayout";

export default function AdsLimitsPage() {
    return (
        <HelpLayout pageTitle="Trajanje oglasa, cena objavljivanja i limiti" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>
                            Na Galset platformi, objavljivanje oglasa je potpuno besplatno za većinu korisnika, uz jasno definisana pravila o trajanju i limitima.
                        </p>
                        
                        <p>
                            Svaki objavljeni oglas traje <strong>30 dana</strong>. Možete objaviti do <strong>10 oglasa mesečno</strong> potpuno besplatno. Ukoliko želite da objavite više od 10 oglasa u toku jednog meseca, svako naredno objavljivanje se naplaćuje prema važećem cenovniku.
                        </p>

                        <p>
                            Kada oglas dostigne 30 dana, on automatski ističe i prebacuje se u karticu <strong>"Istekli oglasi"</strong>. U ovoj kartici oglas je vidljiv samo vama i tu se čuva još <strong>5 dana</strong>.
                        </p>

                        <p>
                            Tokom tih 5 dana imate mogućnost da ponovo objavite oglas. Ukoliko to ne učinite u predviđenom roku, nakon petog dana oglas se trajno briše. To znači da se svi podaci vezani za taj oglas, uključujući broj pregleda, broj korisnika koji prate oglas i ostale statistike, brišu zauvek i ne mogu se povratiti.
                        </p>

                        <p>
                            Savetujemo vam da redovno pratite svoje aktivne i istekle oglase kako ne biste izgubili važne podatke i statistiku o vašim predmetima.
                        </p>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
