"use client";

import Link from "next/link";
import { UserPen, User, Bell, Lock, Languages, SunMoon, Ban, HatGlasses, Info, LifeBuoy, } from "lucide-react";
import { usePathname } from "next/navigation";

export default function DesktopSidebar() {
    const pathname = usePathname();

    const links = [
        { name: "Uredi profil", href: "/settings/profile", icon: UserPen },
        { name: "Lični podaci", href: "/settings/account", icon: User },
        { name: "Obaveštenja", href: "/settings/notifications", icon: Bell },
        { name: "Bezbednost", href: "/settings/security", icon: Lock },
        { name: "Privatnost", href: "/settings/privacy", icon: HatGlasses },
        { name: "Blokirani korisnici", href: "/settings/blocked", icon: Ban },
        { name: "Jezik", href: "/settings/language", icon: Languages },
        { name: "Pomoć", href: "/help", icon: LifeBuoy },
        { name: "Status naloga", href: "/settings/status", icon: Info },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 flex-shrink-0 sticky top-10 h-fit">
            <h1 className="text-2xl font-bold mb-8 px-3 text-text-main">Podešavanja</h1>
            <div className="flex flex-col gap-1">
                {links.map((link) => {
                    const isActive = pathname?.startsWith(link.href);
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center gap-3 px-5 py-3 rounded-full transition-colors text-sm font-medium ${isActive
                                ? "bg-bg-3 text-text-main"
                                : "text-gray-400 hover:bg-bg-2 hover:text-text-main"
                                }`}
                        >
                            <Icon size={20} className={isActive ? "text-text-main" : "text-gray-400"} />
                            {link.name}
                        </Link>
                    );
                })}
            </div>
        </aside>
    );
}
