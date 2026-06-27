import React from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import SearchBar from "@/components/SearchBar";

interface HelpLayoutProps {
  pageTitle?: string;
  children: React.ReactNode;
  hideWrapper?: boolean;
}

export default function HelpLayout({ pageTitle, children, hideWrapper = false }: HelpLayoutProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <SearchBar />

      {pageTitle && (
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          {pageTitle}
        </h1>
      )}

      {hideWrapper ? (
        <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {children}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-gray-100 dark:border-[#2c2c2e] p-8 shadow-sm">
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {children}
          </div>
        </div>
      )}

      <div className="mt-12 p-8 text-center bg-gray-50 dark:bg-[#1c1c1e] rounded-3xl border border-gray-100 dark:border-[#2c2c2e]">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          I dalje vam je potrebna pomoć?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          Naš tim je tu za vas. Popunite kontakt formu ili nam pišite direktno na{" "}
          <a href="mailto:help@galset.com" className="text-[#6366f1] font-medium hover:underline">
            help@galset.com
          </a>
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#5b42f3] hover:bg-[#4b35d6] text-white font-semibold rounded-full transition-all duration-200"
        >
          <Mail size={18} />
          Kontakt forma
        </Link>
      </div>
    </div>
  );
}
