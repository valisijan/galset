import HelpLayout from "@/components/HelpLayout";
import Link from "next/link";

export default function AdsLinksPage() {
    return (
        <HelpLayout pageTitle="Linkovi u oglasu" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>
                            U opisu vašeg oglasa dozvoljeno je postavljanje eksternih linkova, ali pod određenim uslovima. Linkovi mogu biti korisni kupcima kako bi dobili više informacija o proizvodu koji nudite.
                        </p>
                        
                        <p>
                            Možete postaviti link ka vašem zvaničnom sajtu, profilima na društvenim mrežama ili direktan link ka sajtu proizvođača predmeta koji prodajete. Važno je da su ti linkovi isključivo vezani za vas kao prodavca ili konkretan oglas koji postavljate.
                        </p>

                        <p>
                            Svi postavljeni linkovi moraju biti u skladu sa našim pravilima. Pre postavljanja, obavezno pročitajte naše{' '}
                            <Link 
                                href="https://galset.com/terms-of-use" 
                                target="_blank"
                                className="text-[#6366f1] font-medium hover:underline transition-all"
                            >
                                Uslove korišćenja
                            </Link>{' '}
                            kako biste bili sigurni da je vaš link dozvoljen.
                        </p>

                        <p>
                            Napomena: Linkovi koji vode ka konkurentskim platformama za oglašavanje ili sajtovima sa neprikladnim sadržajem nisu dozvoljeni i mogu dovesti do uklanjanja vašeg oglasa.
                        </p>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
