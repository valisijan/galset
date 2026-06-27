"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Sparkles, History, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onSearch: (term?: string) => void;
  placeholder?: string;
  className?: string;
  aiLink?: string;
  storageKey?: string;
  hideButton?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Pretraži oglase...",
  className = "",
  aiLink,
  storageKey = "galset_search_history",
  hideButton = false
}: SearchBarProps) {
  const { user } = useAuth();
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        setHistory([]);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveToHistory = (term: string) => {
    if (!term.trim()) return;

    // Check cookie consent
    const consentStr = localStorage.getItem("galset_consent");
    let canSave = !!user; // Default to true for logged in, false for guests

    if (consentStr) {
      try {
        const consent = JSON.parse(consentStr);
        const isAds = storageKey === "galset_search_history";
        canSave = isAds ? !!consent.ads : !!consent.users;
      } catch (e) { }
    }

    if (!canSave) return;

    const newHistory = [term, ...history.filter(item => item !== term)].slice(0, 7);
    setHistory(newHistory);
    localStorage.setItem(storageKey, JSON.stringify(newHistory));
  };

  const handleInternalSearch = () => {
    saveToHistory(value);
    onSearch(value);
    setShowHistory(false);
  };

  const deleteHistoryItem = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const newHistory = history.filter(item => item !== term);
    setHistory(newHistory);
    localStorage.setItem(storageKey, JSON.stringify(newHistory));
  };

  const selectHistoryItem = (term: string) => {
    onChange(term);
    setTimeout(() => {
      // Check consent again before saving from history selection
      const consentStr = localStorage.getItem("galset_consent");
      let canSave = !!user;

      if (consentStr) {
        try {
          const consent = JSON.parse(consentStr);
          const isAds = storageKey === "galset_search_history";
          canSave = isAds ? !!consent.ads : !!consent.users;
        } catch (e) { }
      }

      const currentHistory = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const updatedHistory = [term, ...currentHistory.filter((item: string) => item !== term)].slice(0, 7);

      if (canSave) {
        setHistory(updatedHistory);
        localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
      }

      onSearch(term);
      setShowHistory(false);
    }, 10);
  };

  return (
    <div ref={containerRef} className={`w-full max-w-2xl flex relative ${className}`}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 z-20">
        <Search size={20} className="w-5 h-5" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowHistory(true)}
        onKeyDown={(e) => e.key === "Enter" && handleInternalSearch()}
        placeholder={placeholder}
        className={`w-full h-11 md:h-13 flex-1 bg-bg-2 border border-bg-3 rounded-full pl-12 ${hideButton ? 'pr-4' : 'pr-[120px] md:pr-[150px]'} text-text-main placeholder-gray-500 focus:outline-none focus:border-bg-3 transition-all text-sm md:text-base`}
      />

      {/* Search History Dropdown */}
      {showHistory && history.length > 0 && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-bg-2 border border-bg-3 rounded-3xl p-2 z-[100]">
          <div className="flex flex-col gap-1">
            {history.map((item, idx) => (
              <div
                key={idx}
                onClick={() => selectHistoryItem(item)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-bg-3 cursor-pointer group transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <History size={18} className="text-gray-500 shrink-0" />
                  <span className="text-text-main text-sm md:text-base truncate">{item}</span>
                </div>
                <button
                  onClick={(e) => deleteHistoryItem(e, item)}
                  className="p-1 text-gray-400 hover:text-text-main transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!hideButton && (
        aiLink ? (
          <Link
            href={aiLink}
            className="absolute right-1.5 top-1.5 bottom-1.5 flex items-center gap-1 md:gap-2 px-3 md:px-5 rounded-full hover:brightness-110 transition-all text-white active:scale-95 z-10"
            style={{ background: 'linear-gradient(135deg, #8a2be2, #6366f1)' }}
          >
            <Sparkles size={18} className="w-4 h-4 md:w-5 md:h-5 text-white" />
            <span className="text-xs md:text-sm font-bold">Galset AI</span>
          </Link>
        ) : (
          <button
            onClick={handleInternalSearch}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-4 md:px-6 bg-[#5b42f3] hover:bg-[#4b35d6] text-white rounded-full transition-all text-xs md:text-sm font-bold active:scale-95 cursor-pointer border-none"
          >
            Traži
          </button>
        )
      )}
    </div>
  );
}
