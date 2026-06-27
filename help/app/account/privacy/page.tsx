import HelpListLayout from "@/components/HelpListLayout";

export default function AccountPrivacyPage() {
    const postingItems = [
        {
            title: `Podešavanja kolačića`,
            href: "/account/privacy/cookies"
        },
        {
            title: `Kako deaktivirati nalog?`,
            href: "/account/privacy/deactivate"
        },
        {
            title: `Kako obrisati nalog?`,
            href: "/account/privacy/delete"
        },
    ];

    const sections = [
        {
            title: "",
            items: postingItems
        }
    ];

    return <HelpListLayout pageTitle="Privatnost" sections={sections} />;
}
