import HelpLayout from "@/components/HelpLayout";
import Link from "next/link";

export default function AdsRemovedPage() {
    return (
        <HelpLayout pageTitle="Oglas je odbijen ili uklonjen" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>
                            Postoji nekoliko razloga zbog kojih vaš oglas može biti odbijen prilikom postavljanja ili naknadno uklonjen sa platforme.
                        </p>
                        
                        <p>
                            Glavni razlog za uklanjanje je kršenje naših pravila. Važno je da znate da Galset tim zadržava pravo da u bilo kom trenutku ukloni oglas ukoliko se utvrdi da on nije u skladu sa našim{' '}
                            <Link 
                                href="https://galset.com/terms-of-use" 
                                target="_blank"
                                className="text-[#6366f1] font-medium hover:underline transition-all"
                            >
                                Uslovima korišćenja
                            </Link>.
                        </p>

                        <p>
                            Najčešći razlozi za uklanjanje oglasa uključuju:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                            <li>Oglašavanje zabranjenih predmeta ili usluga.</li>
                            <li>Korišćenje neprikladnih slika ili uvredljivog jezika u opisu.</li>
                            <li>Postavljanje linkova ka konkurentskim sajtovima.</li>
                            <li>Unošenje netačnih podataka ili namerno obmanjivanje kupaca.</li>
                            <li>Višestruko postavljanje istog oglasa (spamming).</li>
                        </ul>

                        <p>
                            Ukoliko je vaš oglas uklonjen, proverite da li ste dobili obaveštenje sa razlogom uklanjanja. Trudimo se da Galset ostane sigurna i transparentna zajednica za sve korisnike.
                        </p>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
