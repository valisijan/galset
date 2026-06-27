import HelpListLayout from "@/components/HelpListLayout";

export default function AIHistoryPage() {
  const postingItems = [
    {
      title: `Kako da vidim svoju istoriju razgovora?`,
      href: "/ai/history/storage"
    },
    {
      title: `Kako obrisati istoriju razgovora?`,
      href: "/ai/history/delete"
    },
    {
      title: `Kako nastaviti razgovor sa AI?`,
      href: "/ai/history/continue"
    },
    {
      title: `Privatnost podataka`,
      href: "/ai/history/privacy"
    },
  ];

  const sections = [
    {
      title: "",
      items: postingItems
    }
  ];

  return <HelpListLayout pageTitle="Istorija razgovora sa AI" sections={sections} />;
}
