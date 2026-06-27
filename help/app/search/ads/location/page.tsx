import HelpLayout from "@/components/HelpLayout";

export default function SearchAdsLocationPage() {
    return (
        <HelpLayout pageTitle="Pretraga po lokaciji" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    {/* Oglasi u blizini */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Oglasi u blizini</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste pronašli oglase u vašoj neposrednoj blizini,<br />
                            možete otići na sekciju <span className="text-[#6366f1] font-bold">Sve kategorije</span> i izabrati opciju <span className="text-[#6366f1] font-bold">Oglasi u blizini</span>.
                        </p>
                    </div>

                    {/* Ručno podešavanje lokacije */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#6366f1]">Ručno podešavanje lokacije</h3>
                        <div className="h-[1px] w-full bg-[#5b42f3] hover:bg-[#4b35d6]"></div>
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Lokaciju pretrage možete postaviti i ručno,<br />
                            tako što ćete u filterima za pretragu sami izabrati željenu državu i grad za koje želite da vidite oglase.
                        </p>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
