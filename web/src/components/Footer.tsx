"use client"

import { useState } from "react"
import Link from "next/link"
import ThemeModal from "@/components/modals/ThemeModal"

export default function Footer() {
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false)

    return (
        <footer className="bg-bg-1 w-full transition-colors duration-300">
            <div className="max-w-[1920px] mx-auto px-4 py-10 md:py-16">
                <div className="flex flex-col items-center gap-8">

                    {/* Horizontal Links */}
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <Link href="/about" className="hover:text-text-main dark:hover:text-white transition-colors duration-200">O nama</Link>
                        <Link href="/policies/terms-of-use" className="hover:text-text-main dark:hover:text-white transition-colors duration-200">Uslovi korišćenja</Link>
                        <Link href="/policies/privacy-policy" className="hover:text-text-main dark:hover:text-white transition-colors duration-200">Politika privatnosti</Link>
                        <Link href="/policies/cookie-policy" className="hover:text-text-main dark:hover:text-white transition-colors duration-200">Politika kolačića</Link>
                        <button
                            onClick={() => window.dispatchEvent(new Event('show-cookie-banner'))}
                            className="hover:text-text-main dark:hover:text-white transition-colors duration-200 cursor-pointer bg-transparent border-none p-0 text-sm font-medium"
                        >
                            Podešavanja kolačića
                        </button>
                        <Link href="/policies/community-guidelines" className="hover:text-text-main dark:hover:text-white transition-colors duration-200">Smernice zajednice</Link>
                        <Link href="/policies/credits" className="hover:text-text-main dark:hover:text-white transition-colors duration-200">Galset krediti</Link>
                        <Link href="/pricing" className="hover:text-text-main dark:hover:text-white transition-colors duration-200">Cenovnik</Link>
                        <button
                            onClick={() => setIsThemeModalOpen(true)}
                            className="hover:text-text-main dark:hover:text-white transition-colors duration-200 cursor-pointer bg-transparent border-none p-0 text-sm font-medium"
                        >
                            Tema
                        </button>
                        <Link href="/help" className="hover:text-text-main dark:hover:text-white transition-colors duration-200">Pomoć</Link>
                    </div>

                    {/* Social Icons */}
                    <div className="flex gap-4">
                        <a href="https://www.instagram.com/galsetcom/" target="_blank" rel="noopener noreferrer"
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-2 hover:bg-bg-3 border border-bg-3 hover:scale-105 active:scale-95 transition-all duration-200">
                            <img src="https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/social/instagram.svg" alt="Instagram" className="w-5 h-5" />
                        </a>
                        <a href="https://www.facebook.com/galsetcom/" target="_blank" rel="noopener noreferrer"
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-2 hover:bg-bg-3 border border-bg-3 hover:scale-105 active:scale-95 transition-all duration-200">
                            <img src="https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/social/facebook.svg" alt="Facebook" className="w-5 h-5" />
                        </a>
                        <a href="https://www.youtube.com/@galsetcom" target="_blank" rel="noopener noreferrer"
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-2 hover:bg-bg-3 border border-bg-3 hover:scale-105 active:scale-95 transition-all duration-200">
                            <img src="https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/social/youtube.svg" alt="YouTube" className="w-5 h-5" />
                        </a>
                        <a href="https://www.tiktok.com/@galsetcom" target="_blank" rel="noopener noreferrer"
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-2 hover:bg-bg-3 border border-bg-3 hover:scale-105 active:scale-95 transition-all duration-200">
                            <img src="https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/social/tiktok.svg" alt="TikTok" className="w-5 h-5" />
                        </a>
                        <a href="https://x.com/galsetcom" target="_blank" rel="noopener noreferrer"
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-2 hover:bg-bg-3 border border-bg-3 hover:scale-105 active:scale-95 transition-all duration-200">
                            <img src="https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/social/x.svg" alt="X" className="w-4 h-4" />
                        </a>
                    </div>

                    {/* Copyright */}
                    <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                        © 2026 Galset. Sva prava zadržana.
                    </div>
                </div>
            </div>
            <ThemeModal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />
        </footer>
    )
}
