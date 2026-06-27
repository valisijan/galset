import HelpListLayout from "@/components/HelpListLayout";

export default function AdsWishlistPage() {
  const postingItems = [
    {
      title: `Šta je lista želja?`,
      href: "/ads/wishlist/about"
    },
    {
      title: `Kako videti moju listu želja?`,
      href: "/ads/wishlist/view"
    },
    {
      title: `Kako dodati oglas u listu želja?`,
      href: "/ads/wishlist/add-ad"
    },
    {
      title: `Kako ukloniti oglas iz liste želja?`,
      href: "/ads/wishlist/remove-ad"
    },
  ];

  const sections = [
    {
      title: "",
      items: postingItems
    }
  ];

  return <HelpListLayout pageTitle="Lista želja" sections={sections} />;
}
