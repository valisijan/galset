import HelpListLayout from "@/components/HelpListLayout";

export default function GetStartedPage() {
    const postingItems = [
        {
            title: `Kako napraviti nalog?`,
            href: "/account/get-started/create-account"
        },
        {
            title: `Kako se prijaviti?`,
            href: "/account/get-started/login"
        },
        {
            title: `Kako se odjaviti?`,
            href: "/account/get-started/logout"
        },
    ];

    const sections = [
        {
            title: "",
            items: postingItems
        }
    ];

    return <HelpListLayout pageTitle="Početak" sections={sections} />;
}
