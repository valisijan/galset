"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { NAVIGATION_SECTIONS } from "@/lib/navigation";

export const SIDEBAR_SECTIONS = NAVIGATION_SECTIONS;


interface SidebarProps {
    isSidebarOpen: boolean;
    toggleSidebar: (open: boolean) => void;
}

export default function Sidebar({ isSidebarOpen, toggleSidebar }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [openSection, setOpenSection] = useState<string>("");
    const [openSubItems, setOpenSubItems] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                document.body.style.overflow = "";
            } else if (isSidebarOpen) {
                document.body.style.overflow = "hidden";
            }
        };

        if (isSidebarOpen && window.innerWidth < 768) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        window.addEventListener("resize", handleResize);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("resize", handleResize);
        };
    }, [isSidebarOpen, mounted]);

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (isSidebarOpen && typeof window !== "undefined" && window.history.state?.sidebarOpen) {
            e.preventDefault();
            toggleSidebar(false);
            setTimeout(() => {
                router.push(href);
            }, 100);
        } else {
            toggleSidebar(false);
        }
    };

    useEffect(() => {
        if (pathname === "/") {
            setOpenSection("");
            setOpenSubItems(null);
            return;
        }
        const activeSection = SIDEBAR_SECTIONS.find((s) =>
            s.items.some((item) => {
                if (item.href && item.href !== "#" && pathname.startsWith(item.href)) return true;
                if (item.subItems) {
                    return item.subItems.some((sub) => sub.href !== "#" && pathname.startsWith(sub.href));
                }
                return false;
            })
        );
        if (activeSection) {
            setOpenSection(activeSection.title);
            const activeItem = activeSection.items.find(item =>
                item.subItems?.some(sub => sub.href !== "#" && pathname.startsWith(sub.href))
            );
            if (activeItem && openSubItems !== activeItem.label) {
                setOpenSubItems(activeItem.label);
            }
        }
    }, [pathname]);

    const toggleSection = (title: string) => {
        setOpenSection(openSection === title ? "" : title);
    };

    const toggleSubItem = (label: string) => {
        setOpenSubItems(openSubItems === label ? null : label);
    };

    return (
        <>
            {/* SIDEBAR OVERLAY FOR MOBILE */}
            <div
                className={`
          fixed inset-0 top-[73px] bg-black/50 z-30 md:hidden
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
        `}
                onClick={() => toggleSidebar(false)}
            />

            {/* SIDEBAR */}
            <aside
                className={`
          ${isSidebarOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4 md:translate-y-0 pointer-events-none'} 
          md:opacity-100 md:visible md:pointer-events-auto 
          fixed md:relative top-[73px] md:top-0 left-0 h-[calc(100vh-73px)] md:h-auto z-40 md:z-auto 
          flex flex-col w-full md:w-80 md:m-6 bg-white dark:bg-[#1c1c1e]
          overflow-hidden transition-all duration-300 ease-in-out flex-shrink-0
        `}
            >
                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                    {SIDEBAR_SECTIONS.map((section) => (
                        <div key={section.title} className="rounded-xl overflow-hidden cursor-pointer">
                            <button
                                onClick={() => toggleSection(section.title)}
                                className={`w-full flex items-center justify-between p-3 text-left font-medium rounded-2xl transition-colors ${openSection === section.title
                                    ? "bg-[#5b42f3]/10 text-[#5b42f3] dark:bg-[#5b42f3]/20 dark:text-[#7c66ff]"
                                    : "hover:bg-gray-100 dark:hover:bg-[#2c2c2e] text-black dark:text-white"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <section.icon size={18} className={`${openSection === section.title ? "text-[#5b42f3] dark:text-[#7c66ff]" : "text-black dark:text-white"}`} />
                                    <span>{section.title}</span>
                                </div>
                                <ChevronDown
                                    size={16}
                                    className={`transition-transform duration-200 ${openSection === section.title ? "rotate-180" : ""
                                        }`}
                                />
                            </button>
                            <div
                                className={`grid transition-all duration-200 ease-in-out ${openSection === section.title
                                    ? "grid-rows-[1fr] opacity-100 mt-1"
                                    : "grid-rows-[0fr] opacity-0"
                                    }`}
                            >
                                <div className="overflow-hidden">
                                    <ul className="pl-4 pr-2 py-1 space-y-1 border-l-2 border-gray-100 dark:border-[#2c2c2e] ml-4">
                                        {section.items.map((item) => {
                                            const hasSubItems = item.subItems && item.subItems.length > 0;
                                            const isSubMenuOpen = openSubItems === item.label;
                                            const isActive = item.href ? pathname === item.href : false;
                                            const isAnySubItemActive = item.subItems?.some(sub => pathname === sub.href);

                                            if (hasSubItems) {
                                                return (
                                                    <li key={item.label} className="space-y-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleSubItem(item.label);
                                                            }}
                                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${isAnySubItemActive
                                                                ? "bg-[#5b42f3]/10 text-[#5b42f3] dark:bg-[#5b42f3]/20 dark:text-[#7c66ff]"
                                                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium"
                                                                }`}
                                                        >
                                                            <span>{item.label}</span>
                                                            <ChevronDown
                                                                size={14}
                                                                className={`transition-transform duration-200 ${isSubMenuOpen ? "rotate-180" : ""
                                                                    }`}
                                                            />
                                                        </button>
                                                        <div
                                                            className={`grid transition-all duration-200 ease-in-out ${isSubMenuOpen
                                                                ? "grid-rows-[1fr] opacity-100"
                                                                : "grid-rows-[0fr] opacity-0"
                                                                }`}
                                                        >
                                                            <div className="overflow-hidden">
                                                                <ul className="pl-4 space-y-1 border-l border-gray-100 dark:border-[#2c2c2e] ml-4 mt-1">
                                                                    {item.subItems!.map((subItem) => {
                                                                        const isSubActive = pathname === subItem.href;
                                                                        return (
                                                                            <li key={subItem.label}>
                                                                                <Link
                                                                                    href={subItem.href}
                                                                                    onClick={(e) => handleLinkClick(e, subItem.href)}
                                                                                    className={`block px-3 py-1.5 rounded-lg text-[13px] transition-colors ${isSubActive
                                                                                        ? "text-[#5b42f3] dark:text-[#7c66ff] font-bold bg-[#5b42f3]/10 dark:bg-[#5b42f3]/20"
                                                                                        : "text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                                                                                        }`}
                                                                                >
                                                                                    {subItem.label}
                                                                                </Link>
                                                                            </li>
                                                                        );
                                                                    })}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </li>
                                                );
                                            }

                                            return (
                                                <li key={item.label}>
                                                    <Link
                                                        href={item.href || "#"}
                                                        onClick={(e) => handleLinkClick(e, item.href || "#")}
                                                        className={`block px-3 py-2 rounded-xl text-sm transition-colors ${isActive
                                                            ? "bg-[#5b42f3]/20 text-[#5b42f3] dark:bg-[#5b42f3]/30 dark:text-[#7c66ff] font-medium"
                                                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#2c2c2e]"
                                                            }`}
                                                    >
                                                        {item.label}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>


            </aside>
        </>
    );
}
