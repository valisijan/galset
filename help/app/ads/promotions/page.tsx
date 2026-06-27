import HelpListLayout from "@/components/HelpListLayout";

export default function AdsPromotionsPage() {
  const postingItems = [
    {
      title: `Šta su promocije i zašto ih koristiti?`,
      href: "/ads/promotions/about"
    },
    {
      title: `Vrste Galset promocija`,
      href: "/ads/promotions/types"
    },
    {
      title: `Kako aktivirati promociju?`,
      href: "/ads/promotions/activate"
    },
    {
      title: `Trajanje i obnova promocija`,
      href: "/ads/promotions/duration"
    },
    {
      title: `Kombinovanje više promocija`,
      href: "/ads/promotions/combining"
    },
    {
      title: `Praćenje rezultata promocije`,
      href: "/ads/promotions/tracking"
    },
    {
      title: `Cenovnik`,
      href: "https://galset.com/pricing"
    },
  ];

  const sections = [
    {
      title: "",
      items: postingItems
    },
  ];

  return <HelpListLayout pageTitle="Vidljivost i promocije" sections={sections} />;
}
