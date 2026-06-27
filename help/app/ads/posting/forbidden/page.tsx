import HelpLayout from "@/components/HelpLayout";
import Link from "next/link";

export default function AdsForbiddenPage() {
    return (
        <HelpLayout pageTitle="Šta je zabranjeno oglašavati?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>
                            Kako bismo održali sigurnost i kvalitet naše platforme, strogo je zabranjeno oglašavanje određenih predmeta i usluga.
                        </p>
                        
                        <p>
                            Zabranjeno je oglašavati bilo šta što je u suprotnosti sa zakonom, kao i sve stavke koje su jasno navedene u našim pravilima. Pre nego što postavite oglas, obavezno se informišite o tome šta nije dozvoljeno putem naših{' '}
                            <Link 
                                href="https://galset.com/terms-of-use" 
                                target="_blank"
                                className="text-[#6366f1] font-medium hover:underline transition-all"
                            >
                                Uslova korišćenja
                            </Link>.
                        </p>

                        <p>
                            Oglasi koji krše ova pravila biće odmah uklonjeni, a u slučaju ponovljenih prekršaja, korisnički nalog može biti trajno suspendovan. Trudimo se da Galset bude bezbedno mesto za sve naše korisnike i hvala vam što poštujete ova pravila.
                        </p>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
