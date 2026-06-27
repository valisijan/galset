import HelpListLayout from "@/components/HelpListLayout";

export default function ReviewsPage() {
    const postingItems = [
        {
            title: `Kako oceniti korisnika?`,
            href: "/communication/reviews/how-to"
        },
        {
            title: `Kako pregledati ocene korisnika?`,
            href: "/communication/reviews/view"
        },
        {
            title: `Kako pregledati svoje ocene?`,
            href: "/communication/reviews/view-my"
        },
        {
            title: `Uslovi za ocjenjivanje korisnika`,
            href: "/communication/reviews/conditions"
        },
    ];

    const sections = [
        {
            title: "",
            items: postingItems
        }
    ];

    return <HelpListLayout pageTitle="Ocene" sections={sections} />;
}
