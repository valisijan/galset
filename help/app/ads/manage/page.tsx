import HelpListLayout from "@/components/HelpListLayout";

export default function AdsManagePage() {
  const postingItems = [
    {
      title: `Kako upravljati mojim oglasima?`,
      href: "/ads/manage/how-to"
    },
    {
      title: `Kako izmeniti oglas?`,
      href: "/ads/manage/edit"
    },
    {
      title: `Kako obnoviti oglas?`,
      href: "/ads/manage/renew"
    },
    {
      title: `Kako obrisati oglas?`,
      href: "/ads/manage/delete"
    },
    {
      title: `Kako deaktivirati oglas?`,
      href: "/ads/manage/deactivate"
    },
    {
      title: `Kako aktivirati oglas?`,
      href: "/ads/manage/activate"
    },
    {
      title: `Kako označiti oglas kao prodat?`,
      href: "/ads/manage/sold"
    },
    {
      title: `Gde se nalaze moji istekli oglasi?`,
      href: "/ads/manage/expired"
    },
  ];

  const sections = [
    {
      title: "",
      items: postingItems
    }
  ];

  return <HelpListLayout pageTitle="Upravljanje oglasima" sections={sections} />;
}
