import HelpListLayout from "@/components/HelpListLayout";

export default function ReportPage() {
  const postingItems = [
    {
      title: `Kako prijaviti korisnika?`,
      href: "/safety/report/user"
    },
    {
      title: `Kako prijaviti oglas?`,
      href: "/safety/report/ad"
    },
    {
      title: `Kako prijaviti tehnički problem?`,
      href: "/safety/report/problem"
    },
  ];

  const sections = [
    {
      title: "",
      items: postingItems
    }
  ];

  return <HelpListLayout pageTitle="Prijavite nešto" sections={sections} />;
}
