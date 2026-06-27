import HelpListLayout from "@/components/HelpListLayout";

export default function AdsSearchPage() {
  const postingItems = [
    {
      title: `Kako pretraživati oglase?`,
      href: "/search/ads/how-to"
    },
    {
      title: `Kako koristiti filtere?`,
      href: "/search/ads/filters"
    },
    {
      title: `Sortiranje rezultata`,
      href: "/search/ads/sorting"
    },
    {
      title: `Pretraga oglasa po lokaciji`,
      href: "/search/ads/location"
    },
  ];

  const problemItems = [
    {
      title: `Zašto nema rezultata za moju pretragu?`,
      href: "/search/ads/no-results"
    },
  ];

  const sections = [
    {
      title: "",
      items: postingItems
    },
    {
      title: "Problemi sa pretragom oglasa",
      items: problemItems
    }
  ];

  return <HelpListLayout pageTitle="Pretraga oglasa" sections={sections} />;
}
