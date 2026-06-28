"use client";

import Link from "next/link";
import { UserPen, User, Bell, Lock, Languages, SunMoon, Ban, HatGlasses, Info, LifeBuoy, ChevronRight } from "lucide-react";
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

    const isMainSettings = pathname === "/settings";

    return (
        <aside className="flex flex-col w-full h-fit">
            <h1 className="text-2xl font-bold mb-8 px-3 text-text-main text-center">
                Podešavanja
            </h1>
            <div className="flex flex-col gap-1">
                {links.map((link) => {
                    const isActive = pathname?.startsWith(link.href);
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center justify-between py-4 px-6 rounded-full transition-colors group text-text-main ${isActive
                                ? "bg-bg-3"
                                : "hover:bg-bg-2"
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <Icon size={22} className={`transition-colors ${isActive ? "text-text-main" : "text-gray-400 group-hover:text-text-main"}`} />
                                <span className="font-semibold text-[15px]">{link.name}</span>
                            </div>
                            <ChevronRight size={18} className={`transition-opacity ${isActive ? "text-text-main" : "text-gray-500 opacity-60 group-hover:opacity-100"}`} />
                        </Link>
                    );
                })}
            </div>
        </aside>
    );
}
