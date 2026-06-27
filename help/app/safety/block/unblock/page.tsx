import HelpLayout from "@/components/HelpLayout";
import { Settings, UserX } from 'lucide-react';
import Link from 'next/link';

export default function UnblockUserPage() {
    return (
        <HelpLayout pageTitle="Kako odblokirati korisnika?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    <div className="space-y-4">
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste odblokirali korisnika kojeg ste ranije blokirali, pratite ove korake:
                        </p>

                        <div className="space-y-4">
                            <p className="text-gray-700 dark:text-gray-300">
                                1. Idite u <span className="font-bold text-[#6366f1]">Podešavanja</span> i otvorite listu <Link href="/safety/block/view" className="text-[#6366f1] font-bold hover:underline inline-flex items-center gap-1 align-middle"><UserX className="w-4 h-4" /> Blokirani korisnici</Link>.
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">
                                2. Pronađite korisnika kojeg želite da odblokirate na listi.
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">
                                3. Kliknite na dugme <span className="text-[#6366f1] font-bold">Odblokiraj</span> pored njegovog imena.
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">
                                4. Potvrdite akciju u prozoru koji se pojavi.
                            </p>
                        </div>

                        <div className="pt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <p className="text-sm text-blue-800 dark:text-blue-200 italic">
                                * Nakon što odblokirate korisnika, on će ponovo moći da vidi vaše oglase, profil i da vam šalje poruke.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
