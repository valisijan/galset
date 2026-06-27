import HelpListLayout from "@/components/HelpListLayout";

export default function EditProfilePage() {
  const postingItems = [
    {
      title: `Kako izmeniti profilnu sliku?`,
      href: "/account/edit/picture"
    },
    {
      title: `Kako izmeniti ime?`,
      href: "/account/edit/name"
    },
    {
      title: `Kako izmeniti korisničko ime?`,
      href: "/account/edit/username"
    },
    {
      title: `Kako izmeniti državu?`,
      href: "/account/edit/country"
    },
    {
      title: `Kako izmeniti grad?`,
      href: "/account/edit/city"
    },
    {
      title: `Kako izmeniti adresu?`,
      href: "/account/edit/address"
    },
    {
      title: `Kako izmeniti opis profila?`,
      href: "/account/edit/description"
    },
  ];

  const sections = [
    {
      title: "",
      items: postingItems
    }
  ];

  return <HelpListLayout pageTitle="Izmena profila" sections={sections} />;
}
