import HelpListLayout from "@/components/HelpListLayout";

export default function MessagesPage() {
    const postingItems = [
        {
            title: `Kako pregledati poruke?`,
            href: "/communication/messages/view"
        },
        {
            title: `Kako poslati poruku?`,
            href: "/communication/messages/send"
        },
    ];

    const sections = [
        {
            title: "",
            items: postingItems
        }
    ];

    return <HelpListLayout pageTitle="Poruke" sections={sections} />;
}
