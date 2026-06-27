import HelpListLayout from "@/components/HelpListLayout";

export default function AISearchAdsPage() {
  const postingItems = [
    {
      title: `Kako koristiti pretragu oglasa sa AI?`,
      href: "/ai/search/how-to"
    },
  ];

  const problemItems = [
    {
      title: `Greška prilikom pretrage`,
      href: "/ai/search/error"
    },
    {
      title: `AI daje pogrešne odgovore`,
      href: "/ai/search/wrong-responses"
    }
  ];

  const sections = [
    {
      title: "",
      items: postingItems
    },
    {
      title: "Problemi sa pretragom oglasa sa AI",
      items: problemItems
    }
  ];

  return <HelpListLayout pageTitle="Pretraga oglasa sa AI" sections={sections} />;
}
