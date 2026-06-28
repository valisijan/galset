"use client";

import Link from "next/link";
import { UserPen, User, Bell, Lock, ChevronRight, Languages, SunMoon, Ban, HatGlasses, LifeBuoy, Info } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const router = useRouter();

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
        <div className="md:hidden flex flex-col">
            <h1 className="text-2xl font-bold mb-6 text-text-main text-center">Podešavanja</h1>
            <div className="flex flex-col gap-1">
                {links.map((link) => {
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="flex items-center justify-between py-4 px-6 rounded-full transition-colors hover:bg-bg-2 group text-text-main"
                        >
                            <div className="flex items-center gap-4">
                                <Icon size={22} className="text-gray-400 group-hover:text-text-main transition-colors" />
                                <span className="font-semibold text-[15px]">{link.name}</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-500 opacity-60" />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
