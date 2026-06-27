import HelpListLayout from "@/components/HelpListLayout";

export default function PersonalDataPage() {
    const postingItems = [
        {
            title: `Kako izmeniti email adresu?`,
            href: "/account/personal/email"
        },
        {
            title: `Kako izmeniti rođendan?`,
            href: "/account/personal/birthday"
        },
        {
            title: `Kako izmeniti broj telefona?`,
            href: "/account/personal/phone"
        },
    ];

    const sections = [
        {
            title: "",
            items: postingItems
        }
    ];

    return <HelpListLayout pageTitle="Lični podaci" sections={sections} />;
}
