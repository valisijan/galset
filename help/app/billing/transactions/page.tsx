import HelpListLayout from "@/components/HelpListLayout";

export default function TransactionsPage() {
    const postingItems = [
        {
            title: `Kako pregledati istoriju transakcija?`,
            href: "/billing/transactions/view"
        },
    ];

    const sections = [
        {
            title: "",
            items: postingItems
        }
    ];

    return <HelpListLayout pageTitle="Transakcije" sections={sections} />;
}
