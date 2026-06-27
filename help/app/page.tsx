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
      <div className="mt-12">
        <h3 className="text-white text-lg font-bold mb-4 ml-1">Brzi linkovi</h3>
        <div className="bg-[#2c2c2e] rounded-[32px] shadow-sm border border-[#3a3a3c] overflow-hidden">
          {randomArticles.map((article, index) => (
            <Link
              key={index}
              href={article.href}
              className="flex items-center justify-between px-6 py-4 hover:bg-[#3a3a3c] transition-colors group border-b border-[#3a3a3c] last:border-0"
            >
              <div>
                <div className="text-[15px] font-semibold text-gray-100 group-hover:text-[#5b42f3] transition-colors">
                  {article.label}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {article.section}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#3a3a3c] flex items-center justify-center group-hover:bg-[#5b42f3]/10 transition-colors">
                <ChevronRight size={16} className="text-gray-400 group-hover:text-[#5b42f3] transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
