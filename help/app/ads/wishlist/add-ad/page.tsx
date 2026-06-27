import HelpLayout from "@/components/HelpLayout";
import { Heart } from 'lucide-react';

export default function AdsWishlistAddPage() {
    return (
        <HelpLayout pageTitle="Kako dodati oglas u listu želja?" hideWrapper={true}>
            <div className="space-y-8 max-w-3xl">
                <div className="space-y-4 text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                    <p>
                        Da biste dodali oglas u listu želja,<br />
                        na željenom oglasu kliknite na <Heart className="inline-block w-6 h-6 mx-1 text-[#6366f1] mb-1" /> ikonicu.
                    </p>
                    <p>
                        Nakon toga, oglas je uspešno dodat u vašu listu želja i možete mu lako pristupiti u bilo kom trenutku.
                    </p>
                </div>
            </div>
        </HelpLayout>
    );
}
