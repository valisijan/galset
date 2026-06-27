import HelpLayout from "@/components/HelpLayout";

export default function SearchUsersHistoryViewPage() {
    return (
        <HelpLayout pageTitle="Kako pregledati istoriju pretrage korisnika?" hideWrapper={true}>
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-8">

                    <div className="space-y-2">
                        <p className="text-gray-700 dark:text-gray-300 pt-4 leading-relaxed">
                            Da biste pregledali istoriju pretrage korisnika,<br />
                            u polju za pretragu, čim kliknete, automatski će vam se prikazati lista vaših prethodnih pretraga korisnika.
                        </p>
                    </div>

                </div>
            </div>
        </HelpLayout>
    );
}
