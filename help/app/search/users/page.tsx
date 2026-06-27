import HelpListLayout from "@/components/HelpListLayout";

export default function SearchUsersPage() {
  const postingItems = [
    {
      title: `Kako pretraživati korisnike?`,
      href: "/search/users/how-to"
    },
    {
      title: `Šta sve vidim na profilu korisnika?`,
      href: "/search/users/profile-details"
    },
  ];

  const problemItems = [
    {
      title: `Ne mogu da nađem korisnika`,
      href: "/search/users/no-results"
    },
  ];

  const sections = [
    {
      title: "",
      items: postingItems
    },
    {
      title: "Problemi sa pretragom korisnika",
      items: problemItems
    }
  ];

  return <HelpListLayout pageTitle="Pretraga korisnika" sections={sections} />;
}
