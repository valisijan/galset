import HelpListLayout from "@/components/HelpListLayout";

export default function BlockPage() {
  const postingItems = [
    {
      title: `Kako blokirati korisnika?`,
      href: "/safety/block/how-to"
    },
    {
      title: `Kako odblokirati korisnika?`,
      href: "/safety/block/unblock"
    },
    {
      title: `Kako videti listu blokiranih korisnika?`,
      href: "/safety/block/view"
    },
    {
      title: `Šta se desi kad blokiram korisnika?`,
      href: "/safety/block/what-happens"
    },
  ];

  const sections = [
    {
      title: "",
      items: postingItems
    }
  ];

  return <HelpListLayout pageTitle="Blokiranje korisnika" sections={sections} />;
}
