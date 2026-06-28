import Link from "next/link";
import { ChevronRight, Mail } from "lucide-react";
import SearchBar from "@/components/SearchBar";

interface HelpItem {
  title: string;
  href: string;
}

interface HelpSection {
  title: string;
  items: HelpItem[];
}

interface HelpListLayoutProps {
  pageTitle?: string;
  sections: HelpSection[];
}

export default function HelpListLayout({ pageTitle, sections }: HelpListLayoutProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <SearchBar />

      {pageTitle && (
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          {pageTitle}
        </h1>
      )}

      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className={sectionIndex > 0 ? "mt-12" : ""}>
          {section.title && (
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              {section.title}
            </h2>
          )}

          <div className="space-y-3">
            {section.items.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="group flex items-center justify-between px-6 py-4 bg-bg-2 border border-bg-3 rounded-full transition-colors duration-200 hover:border-[#6366f1]/50"
              >
                <span className="font-semibold text-text-main group-hover:text-[#6366f1] transition-colors">
                  {item.title}
                </span>
                <ChevronRight
                  size={20}
                  className="text-gray-400 group-hover:text-[#6366f1] transition-all duration-200 group-hover:translate-x-1 shrink-0"
                />
              </Link>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-12 p-8 text-center bg-bg-2 rounded-3xl border border-bg-3">
        <h3 className="text-xl font-bold text-text-main mb-2">
          I dalje vam je potrebna pomoć?
        </h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Naš tim je tu za vas. Popunite kontakt formu ili nam pišite direktno na{" "}
          <a href="mailto:support@galset.com" className="text-[#6366f1] font-medium hover:underline">
            support@galset.com
          </a>
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#5b42f3] hover:bg-[#4b35d6] text-white font-semibold rounded-full transition-colors duration-200"
        >
          <Mail size={18} />
          Kontakt forma
        </Link>
      </div>
    </div>
  );
}
