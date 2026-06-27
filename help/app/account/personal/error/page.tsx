import HelpLayout from "@/components/HelpLayout";
import { Mail, MessageSquare, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function PersonalDataErrorPage() {
    return (
        <HelpLayout pageTitle="Greška prilikom izmene ličnih podataka" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    <div className="space-y-4">
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Ukoliko imate problema sa izmenom email adrese, broja telefona ili datuma rođenja, proverite sledeće savete:
                        </p>

                        <div className="space-y-6">
                            {/* Problem sa Email verifikacijom */}
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-[#6366f1] flex items-center gap-2">
                                    <Mail className="w-5 h-5" /> Problem sa verifikacijom email-a
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Ako ne dobijate verifikacioni kod ili dobijate grešku:
                                </p>
                                <ul className="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                                    <li>Proverite <span className="font-bold">Spam (Neželjena pošta)</span> fasciklu.</li>
                                    <li>Verifikacioni kod važi ograničeno vreme (par minuta). Ukoliko je istekao, zatražite novi.</li>
                                    <li>Uverite se da ste ispravno ukucali novu email adresu.</li>
                                </ul>
                            </div>

                            {/* Problem sa Brojem telefona */}
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-[#6366f1] flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5" /> Izmena broja telefona
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Uverite se da je broj telefona u ispravnom formatu i da već nije povezan sa drugim nalogom na Galset platformi.
                                </p>
                            </div>

                            {/* Opšta greška sistema */}
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-[#6366f1] flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" /> Opšta greška
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Ako se pojavljuje neodređena greška, pokušajte da osvežite aplikaciju ili se odjavite i ponovo prijavite na nalog pre nego što ponovo pokušate izmenu.
                                </p>
                            </div>
                        </div>

                        <div className="pt-6">
                            <Link href="/account/personal" className="inline-flex items-center gap-2 text-[#6366f1] font-bold hover:underline">
                                ← Povratak na lične podatke
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
