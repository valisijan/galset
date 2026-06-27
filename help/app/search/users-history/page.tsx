import HelpListLayout from "@/components/HelpListLayout";

export default function UsersHistoryPage() {
    const postingItems = [
        {
            title: `Kako pregledati istoriju pretrage korisnika?`,
            href: "/search/users-history/view"
        },
        {
            title: `Kako isključiti čuvanje pretraga korisnika?`,
            href: "/search/users-history/disable"
        },
        {
            title: `Kako uključiti čuvanje pretraga korisnika?`,
            href: "/search/users-history/enable"
        },
        {
            title: `kako obrisati istoriju pretrage korisnika?`,
            href: "/search/users-history/delete"
        }
    ];

    const sections = [
        {
            title: "",
            items: postingItems
        }
    ];

    return <HelpListLayout pageTitle="Istorija pretrage korisnika" sections={sections} />;
}
