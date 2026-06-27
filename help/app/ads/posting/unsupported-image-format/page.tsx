import HelpLayout from "@/components/HelpLayout";

export default function AdsUnsupportedImagePage() {
    return (
        <HelpLayout pageTitle="Format slike nije podržan" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>
                            Ukoliko dobijate obaveštenje da format slike nije podržan, molimo vas da proverite tip fajla koji pokušavate da otpremite.
                        </p>
                        
                        <p>
                            Galset platforma trenutno podržava sledeće formate slika:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-2 font-medium">
                            <li>JPG / JPEG</li>
                            <li>PNG</li>
                            <li>WEBP</li>
                        </ul>

                        <p>
                            Pored samog formata, važno je obratiti pažnju i na veličinu slike. Maksimalna dozvoljena veličina pojedinačnog fajla je <strong>5 MB</strong>.
                        </p>

                        <p>
                            Ako je vaša slika u podržanom formatu, ali je veća od 5 MB, pokušajte da je smanjite (resize) ili kompresujete pre ponovnog otpremanja. Slike u drugim formatima (kao što su TIFF, BMP ili PDF) sistem neće prihvatiti.
                        </p>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
