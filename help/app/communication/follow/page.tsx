import HelpListLayout from "@/components/HelpListLayout";

export default function FollowPage() {
    const postingItems = [
        {
            title: `Kako zapratiti korisnika?`,
            href: "/communication/follow/how-to"
        },
        {
            title: `Kako otpratiti korisnika?`,
            href: "/communication/follow/unfollow"
        },
        {
            title: `Kako pregledati listu korisnika koje pratim?`,
            href: "/communication/follow/view-following"
        },
        {
            title: `Kako pregledati listu korisnika koji me prate?`,
            href: "/communication/follow/view-followers"
        },
    ];

    const sections = [
        {
            title: "",
            items: postingItems
        }
    ];

    return <HelpListLayout pageTitle="Praćenje" sections={sections} />;
}
