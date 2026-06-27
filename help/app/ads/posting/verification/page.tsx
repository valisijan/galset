import HelpLayout from "@/components/HelpLayout";
import Link from "next/link";

export default function AdsVerificationPage() {
    return (
        <HelpLayout pageTitle="Provera i odobravanje oglasa" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>
                            Nakon što uspešno prođete sve korake i kliknete na dugme "Objavi", vaš oglas postaje <strong>momentalno aktivan</strong> i vidljiv svim posetiocima Galset platforme.
                        </p>

                        <p>
                            Nema perioda čekanja na odobrenje – čim završite proces postavljanja, vaš predmet ili usluga su dostupni za pretragu i pregled.
                        </p>

                        <p>
                            Ipak, važno je da znate da naš sistem i moderatori vrše naknadnu proveru svih oglasa. Ukoliko se utvrdi da oglas krši naše{' '}
                            <Link
                                href="https://galset.com/terms-of-use"
                                target="_blank"
                                className="text-[#6366f1] font-medium hover:underline transition-all"
                            >
                                Uslove korišćenja
                            </Link>, on može biti uklonjen u bilo kom trenutku nakon objavljivanja.
                        </p>

                        <p>
                            Savetujemo vam da uvek proverite sadržaj svog oglasa kako biste bili sigurni da je u skladu sa pravilima i kako biste izbegli eventualno brisanje.
                        </p>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
