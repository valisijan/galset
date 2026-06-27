import HelpLayout from "@/components/HelpLayout";
import { MessageSquareOff, EyeOff, UserX, Search } from 'lucide-react';

export default function WhatHappensWhenBlockPage() {
    return (
        <HelpLayout pageTitle="Šta se dešava kada blokiram nekoga?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    <div className="space-y-6">
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Kada blokirate korisnika na Galsetu, primenjuju se sledeća pravila radi vaše bezbednosti i privatnosti:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Poruke */}
                            <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3">
                                <MessageSquareOff className="w-8 h-8 text-red-500" />
                                <h3 className="font-bold text-gray-900 dark:text-white">Komunikacija</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Blokirani korisnik više ne može da vam šalje poruke niti da vas kontaktira putem platforme.
                                </p>
                            </div>

                            {/* Vidljivost oglasa */}
                            <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3">
                                <EyeOff className="w-8 h-8 text-red-500" />
                                <h3 className="font-bold text-gray-900 dark:text-white">Vidljivost oglasa</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Vaši oglasi neće biti vidljivi blokiranom korisniku, niti će on moći da vidi vaše buduće objave.
                                </p>
                            </div>

                            {/* Profil */}
                            <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3">
                                <UserX className="w-8 h-8 text-red-500" />
                                <h3 className="font-bold text-gray-900 dark:text-white">Profil</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Blokirani korisnik ne može da pregleda vaš profil, listu vaših pratilaca niti koga vi pratite.
                                </p>
                            </div>

                            {/* Pretraga */}
                            <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3">
                                <Search className="w-8 h-8 text-red-500" />
                                <h3 className="font-bold text-gray-900 dark:text-white">Rezultati pretrage</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Vaš nalog i vaši oglasi se neće pojavljivati u rezultatima pretrage tom korisniku.
                                </p>
                            </div>
                        </div>

                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                <span className="font-bold">Napomena:</span> Korisnik neće dobiti obaveštenje da ste ga blokirali, ali će shvatiti ukoliko pokuša da poseti vaš profil ili oglas koji je ranije video.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
