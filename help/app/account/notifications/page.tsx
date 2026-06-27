import HelpListLayout from "@/components/HelpListLayout";

export default function NotificationsPage() {
    const postingItems = [
        {
            title: `Kako iskljuciti obavestenja?`,
            href: "/account/notifications/turn-off"
        },
        {
            title: `Kako ukljuciti obavestenja?`,
            href: "/account/notifications/turn-on"
        },
    ];

    const problemItems = [
        {
            title: `Ne primam obaveštenja`,
            href: "/account/notifications/not-receiving"
        },
    ];

    const sections = [
        {
            title: "",
            items: postingItems
        },
        {
            title: "Problemi sa obaveštenjima",
            items: problemItems
        }
    ];

    return <HelpListLayout pageTitle="Obaveštenja" sections={sections} />;
}
