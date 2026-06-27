import HelpLayout from "@/components/HelpLayout";
import { Settings, Bell, Smartphone } from 'lucide-react';
import Link from 'next/link';

export default function NotReceivingNotificationsPage() {
    return (
        <HelpLayout pageTitle="Zašto ne primam obaveštenja?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    <div className="space-y-4">
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Ako ne primate obaveštenja od Galset aplikacije, proverite sledeće stavke:
                        </p>

                        <div className="space-y-6">
                            {/* Provera u aplikaciji */}
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-[#6366f1] flex items-center gap-2">
                                    <Bell className="w-5 h-5" /> Podešavanja u aplikaciji
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Proverite da li su obaveštenja uključena unutar same aplikacije. Idite na <span className="font-bold">Podešavanja</span> {'>'} <span className="font-bold text-[#6366f1]">Obaveštenja</span> i uverite se da su prekidači za željene kategorije aktivni.
                                    Više o tome pročitajte <Link href="/account/notifications/turn-on" className="text-[#6366f1] underline">ovde</Link>.
                                </p>
                            </div>

                            {/* Provera u sistemu telefona */}
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-[#6366f1] flex items-center gap-2">
                                    <Smartphone className="w-5 h-5" /> Podešavanja telefona
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Vaš telefon možda blokira obaveštenja Galset aplikacije:
                                </p>
                                <ul className="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                                    <li>Idite u sistemska podešavanja vašeg telefona.</li>
                                    <li>Pronađite sekciju <span className="font-bold">Aplikacije</span> ili <span className="font-bold">Obaveštenja</span>.</li>
                                    <li>Izaberite <span className="font-bold">Galset</span> i uverite se da je opcija <span className="font-bold text-[#6366f1]">Dozvoli obaveštenja</span> uključena.</li>
                                </ul>
                            </div>

                            {/* Režim ne uznemiravaj */}
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-[#6366f1]">Režim "Ne uznemiravaj"</h3>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Proverite da li je na vašem uređaju uključen režim <span className="font-bold">Ne uznemiravaj (Do Not Disturb)</span> ili <span className="font-bold">Tihi režim</span>, koji može sprečiti pojavljivanje obaveštenja.
                                </p>
                            </div>

                            {/* Internet konekcija */}
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-[#6366f1]">Internet konekcija</h3>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Obaveštenja se šalju putem interneta. Proverite da li imate stabilnu Wi-Fi ili mobilnu internet vezu.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
