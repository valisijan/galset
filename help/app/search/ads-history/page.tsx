import HelpListLayout from "@/components/HelpListLayout";

export default function AdsHistoryPage() {
    const postingItems = [
        {
            title: `Kako pregledati istoriju pretrage oglasa?`,
            href: "/search/ads-history/view"
        },
        {
            title: `Kako isključiti čuvanje istorije pretrage oglasa?`,
            href: "/search/ads-history/disable"
        },
        {
            title: `Kako uključiti čuvanje istorije pretrage oglasa?`,
            href: "/search/ads-history/enable"
        },
        {
            title: `Kako izbrisati oglas iz istorije pretrage?`,
            href: "/search/ads-history/delete"
        },
    ];

    const sections = [
        {
            title: "",
            items: postingItems
        }
    ];

    return <HelpListLayout pageTitle="Istorija pretrage oglasa" sections={sections} />;
}
