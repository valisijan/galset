import HelpListLayout from "@/components/HelpListLayout";

export default function AdsStatsPage() {
  const postingItems = [
    {
      title: `Šta vidim u statistici oglasa?`,
      href: "/ads/stats/about"
    },
    {
      title: `Kako da vidim statistiku oglasa?`,
      href: "/ads/stats/access"
    },
    {
      title: `Kako videti ukupan broj pregleda oglasa?`,
      href: "/ads/stats/views"
    },
    {
      title: `Kako videti koliko ljudi je sačuvalo oglas?`,
      href: "/ads/stats/wishlist"
    },
    {
      title: `Kako videti broj poruka oglasa?`,
      href: "/ads/stats/messages"
    },
  ];

  const sections = [
    {
      title: "",
      items: postingItems
    }
  ];

  return <HelpListLayout pageTitle="Statistika oglasa" sections={sections} />;
}
