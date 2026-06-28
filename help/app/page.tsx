"use client";

import { ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import { HELP_INDEX } from "@/lib/help-index";

export default function SupportCenterPage() {
  const [randomArticles, setRandomArticles] = useState<{ label: string; href: string; section: string }[]>([]);

  const allArticles = HELP_INDEX.map(article => ({
    label: article.title,
    href: article.path.startsWith('http') ? article.path : `${article.path}?open=${article.index}`,
    section: article.category
  }));


  useEffect(() => {
    const shuffled = [...allArticles].sort(() => 0.5 - Math.random());
    setRandomArticles(shuffled.slice(0, 6));
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Kako vam možemo pomoći?</h2>

      <SearchBar />

      {/* Quick Links Section */}
      <h3 className="text-text-main text-lg font-bold mt-12 mb-4 ml-1">Brzi linkovi</h3>
      <div className="bg-bg-2 rounded-[32px] border border-bg-3 p-2 flex flex-col gap-1">
        {randomArticles.map((article, index) => (
          <Link
            key={index}
            href={article.href}
            className="flex items-center justify-between px-4 py-3 hover:bg-bg-3 rounded-3xl transition-all group"
          >
            <div>
              <div className="text-[15px] font-semibold text-text-main group-hover:text-[#5b42f3] transition-colors">
                {article.label}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {article.section}
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-bg-3 flex items-center justify-center group-hover:bg-[#5b42f3]/10 transition-colors">
              <ChevronRight size={16} className="text-gray-400 group-hover:text-[#5b42f3] transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
