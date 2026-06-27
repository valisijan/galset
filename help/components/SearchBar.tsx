"use client";

import { Search, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { HELP_INDEX } from "@/lib/help-index";

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<{ label: string; href: string; section: string }[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const allArticles = HELP_INDEX.map(article => ({
    label: article.title,
    href: article.path.startsWith('http') ? article.path : `${article.path}?open=${article.index}`,
    section: article.category
  }));


  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const filtered = allArticles.filter(article =>
        article.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.section.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8);
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mb-8 relative shadow-sm rounded-full" ref={searchRef}>
      <div className="relative group">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Pretražite članke pomoći..."
          className="w-full px-6 py-4 pl-14 rounded-full border border-[#3a3a3c] bg-[#2c2c2e] text-gray-100 placeholder-gray-400 outline-none focus:ring-0 focus:border-[#6366f1] transition-colors"
        />
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
      </div>

      {/* Search Results Dropdown */}
      {isFocused && searchQuery.trim().length > 1 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#2c2c2e] rounded-3xl shadow-2xl border border-[#3a3a3c] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {results.length > 0 ? (
            <div className="py-2">
              {results.map((result, index) => (
                <Link
                  key={index}
                  href={result.href}
                  onClick={() => setIsFocused(false)}
                  className="flex items-center justify-between px-4 py-3 hover:bg-[#3a3a3c] transition-colors group"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-100 group-hover:text-[#5b42f3] transition-colors">
                      {result.label}
                    </div>
                    <div className="text-xs text-gray-400">
                      {result.section}
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-[#5b42f3] transition-colors" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#3a3a3c] mb-3">
                <Search size={20} className="text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {`Nijedan članak se ne podudara sa pretragom "{query}"`.replace("{query}", searchQuery)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
