import HelpListLayout from "@/components/HelpListLayout";

export default function SecurityPage() {
    const postingItems = [
        {
            title: `Kako promeniti lozinku?`,
            href: "/account/security/password"
        },
        {
            title: `Kako se odjaviti sa svih uređaja?`,
            href: "/account/security/logout-all-devices"
        },
        {
            title: `Kako odjaviti određeni uređaj?`,
            href: "/account/security/logout-device"
        }
    ];

    const sections = [
        {
            title: "",
            items: postingItems
        }
    ];

    return <HelpListLayout pageTitle="Lozinka i bezbednost" sections={sections} />;
}
