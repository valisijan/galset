import HelpListLayout from "@/components/HelpListLayout";

export default function AIAboutPage() {
  const postingItems = [
    {
      title: `Šta je Galset AI asistent?`,
      href: "/ai/about/introduction"
    },
    {
      title: `Kako započeti razgovor?`,
      href: "/ai/about/start"
    },
    {
      title: `Ograničenja AI modela?`,
      href: "/ai/about/limits"
    },
  ];

  const problemItems = [
    {
      title: `Greška u AI razgovoru`,
      href: "/ai/about/chat-error"
    },
  ];

  const sections = [
    {
      title: "",
      items: postingItems
    },
    {
      title: "Problemi sa Galset AI",
      items: problemItems
    }
  ];

  return <HelpListLayout pageTitle="O Galset AI" sections={sections} />;
}
