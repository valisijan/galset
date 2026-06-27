import HelpListLayout from "@/components/HelpListLayout";

export default function SettingsPage() {
  const postingItems = [
    {
      title: `Kako promeniti jezik?`,
      href: "/account/settings/language"
    },
    {
      title: `Kako promeniti temu?`,
      href: "/account/settings/theme"
    },
    {
      title: `Kako promeniti izgled oglasa?`,
      href: "/account/settings/ads-view"
    },
  ];

  const sections = [
    {
      title: "",
      items: postingItems
    }
  ];

  return <HelpListLayout pageTitle="Podešavanja" sections={sections} />;
}
