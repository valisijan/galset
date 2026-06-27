import { Sparkles, Search, Megaphone, CreditCard, User, MessageCircle, ShieldCheck, FileText } from "lucide-react";

export type Item = {
    label: string;
    href: string;
    subItems?: { label: string; href: string }[];
};


export type Section = {
    title: string;
    items: Item[];
    icon: any;
};

export const NAVIGATION_SECTIONS: Section[] = [
    {
        title: "Galset AI",
        icon: Sparkles,
        items: [
            { label: "O Galset AI", href: "/ai/about" },
            { label: "Pretraga oglasa sa AI", href: "/ai/search" },
            { label: "Istorija razgovora sa AI", href: "/ai/history" }
        ]
    },
    {
        title: "Oglasi",
        icon: Megaphone,
        items: [
            { label: "Postavljanje oglasa", href: "/ads/posting" },
            { label: "Upravljanje oglasima", href: "/ads/manage" },
            { label: "Vidljivost i promocije", href: "/ads/promotions" },
            { label: "Lista želja", href: "/ads/wishlist" },
            { label: "Statistika oglasa", href: "/ads/stats" }
        ],
    },
    {
        title: "Pretraga",
        icon: Search,
        items: [
            { label: "Pretraga oglasa", href: "/search/ads" },
            { label: "Pretraga korisnika", href: "/search/users" },
            { label: "Istorija pretrage oglasa", href: "/search/ads-history" },
            { label: "Istorija pretrage korisnika", href: "/search/users-history" }
        ]
    },
    {
        title: "Plaćanje",
        icon: CreditCard,
        items: [
            { label: "Cenovnik", href: "https://galset.com/pricing" },
            { label: "Galset krediti", href: "https://galset.com/policies/credits" },
            { label: "Transakcije", href: "/billing/transactions" }
        ]
    },
    {
        title: "Komunikacija",
        icon: MessageCircle,
        items: [
            { label: "Poruke", href: "/communication/messages" },
            { label: "Ocene", href: "/communication/reviews" },
            { label: "Praćenje korisnika", href: "/communication/follow" }
        ]
    },
    {
        title: "Moj Nalog",
        icon: User,
        items: [
            { label: "Prijava i registracija", href: "/account/get-started" },
            { label: "Izmena profila", href: "/account/edit" },
            { label: "Lični podaci", href: "/account/personal" },
            { label: "Obaveštenja", href: "/account/notifications" },
            { label: "Lozinka i bezbednost", href: "/account/security" },
            { label: "Privatnost", href: "/account/privacy" },
            { label: "Podešavanja", href: "/account/settings" }
        ]
    },
    {
        title: "Bezbednost",
        icon: ShieldCheck,
        items: [
            { label: "Prijavite nešto", href: "/safety/report" },
            { label: "Blokiranje korisnika", href: "/safety/block" }
        ],
    },
    {
        title: "Uslovi i Politike",
        icon: FileText,
        items: [
            { label: "Uslovi korišćenja", href: "https://galset.com/policies/terms-of-use" },
            { label: "Politika privatnosti", href: "https://galset.com/policies/privacy-policy" },
            { label: "Politika kolačića", href: "https://galset.com/policies/cookie-policy" },
            { label: "Smernice zajednice", href: "https://galset.com/policies/community-guidelines" }
        ]
    }
];

export const ALL_NAV_ITEMS = NAVIGATION_SECTIONS.flatMap(section => 
    section.items.map(item => ({
        ...item,
        section: section.title
    }))
);
