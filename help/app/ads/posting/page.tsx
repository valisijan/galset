import HelpListLayout from "@/components/HelpListLayout";

export default function AdsPostingPage() {
  const postingItems = [
    {
      title: `Kako postaviti oglas?`,
      href: "/ads/posting/how-to"
    },
    {
      title: `Pisanje naslova i opisa oglasa`,
      href: "/ads/posting/title-description"
    },
    {
      title: `Određivanje cene oglasa`,
      href: "/ads/posting/price"
    },
    {
      title: `Dodavanje filtera oglasa`,
      href: "/ads/posting/filters"
    },
    {
      title: `Linkovi u oglasu`,
      href: "/ads/posting/links"
    },
    {
      title: `Kontakt podaci oglasa`,
      href: "/ads/posting/contact-info"
    },
    {
      title: `Šta je zabranjeno oglašavati?`,
      href: "/ads/posting/forbidden"
    },
    {
      title: `Provera i odobravanje oglasa`,
      href: "/ads/posting/verification"
    },
    {
      title: `Trajanje oglasa, cena objavljivanja i limiti`,
      href: "/ads/posting/limits"
    },
  ];

  const problemItems = [
    {
      title: `Greška prilikom objavljivanja oglasa`,
      href: "/ads/posting/error"
    },
    {
      title: `Oglas je odbijen ili uklonjen`,
      href: "/ads/posting/removed"
    },
    {
      title: `Format slike nije podržan`,
      href: "/ads/posting/unsupported-image-format"
    }
  ];

  const sections = [
    {
      title: "",
      items: postingItems
    },
    {
      title: "Problemi sa postavljanjem oglasa",
      items: problemItems
    }
  ];

  return <HelpListLayout pageTitle="Postavljanje oglasa" sections={sections} />;
}
