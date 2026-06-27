"use client";

import { MessageCircle, X, ArrowUp, Bot, User, ChevronRight, Sparkles, Maximize2, Minimize2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { HELP_INDEX } from "@/lib/help-index";
import Link from "next/link";

interface Message {
  id: string;
  type: "bot" | "user";
  text: string;
  link?: { path: string; label: string; index: number };
}

export default function ChatSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "1",
          type: "bot",
          text: `Zdravo! Ja sam Galset AI asistent. Kako vam mogu pomoći danas?`
        }
      ]);
    }
  }, [messages.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node) && window.innerWidth >= 640) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.history.pushState({ chatOpen: true }, "");
      window.addEventListener("popstate", handlePopState);
    }

    return () => window.removeEventListener("popstate", handlePopState);
  }, [isOpen]);

  const isFuzzyMatch = (s1: string, s2: string) => {
    const s1L = s1.toLowerCase();
    const s2L = s2.toLowerCase();
    if (s1L.includes(s2L) || s2L.includes(s1L)) return true;

    if (Math.abs(s1L.length - s2L.length) <= 1) {
      let diffs = 0;
      for (let i = 0; i < Math.min(s1L.length, s2L.length); i++) {
        if (s1L[i] !== s2L[i]) diffs++;
      }
      return diffs <= 1;
    }
    return false;
  };

  const handleSearch = (userInput: string) => {
    const q = userInput.toLowerCase().trim();

    const rsGreetings = ["zdravo", "ćao", "cao", "dobar dan", "pozdrav", "ej", "desi"];
    const enGreetings = ["hello", "hi", "hey", "greetings", "good morning", "good afternoon"];
    if (rsGreetings.some(g => isFuzzyMatch(q, g)) || enGreetings.some(g => isFuzzyMatch(q, g))) {
      return {
        text: "Zdravo! Kako mogu da vam pomognem oko Galset portala?"
      };
    }

    const rsBrandWords = ["šta je galset", "sta je galset", "čemu služi", "cemu sluzi", "najbolji", "najjači", "najbolja", "dobra platforma", "vredi li", "vrijedi li", "dobar sajt", "zasto galset"];
    const enBrandWords = ["what is galset", "about galset", "the best", "greatest", "good platform", "is it worth"];
    const isBrandQuery = rsBrandWords.some(s => q.includes(s) || isFuzzyMatch(q, s)) || enBrandWords.some(s => q.includes(s) || isFuzzyMatch(q, s));

    if (isBrandQuery) {
      if (q.includes("najbolj") || q.includes("najjac") || q.includes("best") || q.includes("dobr") || q.includes("vredi")) {
        return {
          text: "Apsolutno! Galset je vodeći portal koji koristi najsavremeniju tehnologiju kako bi spajao prodavce i kupce na najbrži i najsigurniji način. Mi nismo samo sajt za oglase, mi smo vaš pametni partner u trgovini."
        };
      }
      return {
        text: "Galset je moderna platforma za oglašavanje dizajnirana da vam olakša život. Bilo da kupujete ili prodajete, naši AI alati vam pomažu da to uradite brže nego bilo gde drugde."
      };
    }

    const rsSupportWords = ["pomoć", "pomoc", "problem", "podrška", "podrska", "kontakt", "ne mogu", "nema rešenja", "rešenje", "ne radi", "neće", "greška"];
    const enSupportWords = ["help", "support", "contact", "problem", "solve", "solution", "not working", "error", "bug"];
    if (rsSupportWords.some(s => q.includes(s) || isFuzzyMatch(q, s)) || enSupportWords.some(s => q.includes(s) || isFuzzyMatch(q, s))) {
      return {
        text: "Ne brinite, tu sam da pomognem! Ako niste pronašli odgovor u mojim uputstvima, uvek možete kontaktirati naš tim podrške direktno na support@galset.com. Mi smo tu za vas 24/7."
      };
    }

    if (q.length < 3) return { text: "Slušam vas! Recite mi konkretno šta vas zanima?" };

    const queryWords = q.split(/\s+/).filter(w => w.length > 2);
    const scoredArticles = HELP_INDEX.map(article => {
      let score = 0;
      article.keywords?.forEach(kw => {
        queryWords.forEach(word => {
          if (word === kw.toLowerCase()) score += 20;
          else if (isFuzzyMatch(word, kw.toLowerCase())) score += 10;
        });
      });
      return { article, score };
    });

    scoredArticles.sort((a, b) => b.score - a.score);
    const topMatch = scoredArticles[0];

    if (topMatch && topMatch.score >= 10) {
      const match = topMatch.article;
      return {
        text: match.title,
        link: { path: match.path, label: "Vidi detaljno uputstvo", index: match.index }
      };
    }

    return {
      text: "Izvinite, nisam siguran da sam vas razumeo. Možda vas zanima kako da postavite oglas ili kako rade promocije?"
    };
  };

  const sendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), type: "user", text: query };
    setMessages(prev => [...prev, userMsg]);
    const currentQuery = query;
    setQuery("");
    setIsTyping(true);

    const textarea = document.querySelector('textarea');
    if (textarea) textarea.style.height = 'auto';

    setTimeout(() => {
      const response = handleSearch(currentQuery);
      const botMsg: Message = { id: (Date.now() + 1).toString(), type: "bot", text: response.text, link: response.link };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      {/* FAB Button (privremeno sakriveno) */}
      {/*
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full flex items-center justify-center bg-[linear-gradient(30deg,#00D2C8,#6B52F5,#C850C0,#FF4D6D,#FF8C00)] text-white shadow-2xl hover:brightness-110 transition-all duration-300 hover:scale-110 active:scale-95 hover:rotate-12 cursor-pointer"
        >
          <MessageCircle size={28} />
        </button>
      )}
      */}

      {/* Chat Window */}
      {shouldRender && (
        <div
          ref={chatRef}
          className={`
            fixed z-[101] flex flex-col overflow-hidden transition-all duration-300 ease-out bg-white dark:bg-[#1c1c1e]
            ${isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95 pointer-events-none"}
            ${isMaximized
              ? "inset-x-0 bottom-0 top-[73px] sm:top-[97px] sm:left-[368px] sm:bottom-[97px] sm:right-6 sm:rounded-3xl shadow-2xl sm:shadow-sm border-0 sm:border border-gray-100 dark:border-[#2c2c2e]"
              : "inset-0 sm:inset-auto sm:bottom-24 sm:right-6 w-full sm:w-[400px] h-full sm:h-[600px] sm:rounded-3xl shadow-2xl sm:shadow-sm border-0 sm:border border-gray-100 dark:border-[#2c2c2e]"
            }
          `}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-[linear-gradient(30deg,#00D2C8,#6B52F5,#C850C0,#FF4D6D,#FF8C00)] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Galset AI</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="text-[12px] opacity-80 font-bold tracking-wider text-white">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMaximized(!isMaximized)} className="hidden sm:flex p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white cursor-pointer">
                {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar ${isMaximized ? "sm:px-12 lg:px-24" : "p-4"}`}>
            <div className={`${isMaximized ? "max-w-4xl mx-auto w-full space-y-4" : "w-full space-y-4"}`}>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`space-y-2 ${isMaximized ? "max-w-[85%]" : "max-w-[90%]"}`}>
                    <div className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words overflow-hidden [word-break:break-word] ${msg.type === "user" ? "bg-[#5b42f3] hover:bg-[#4b35d6] text-white rounded-[24px] shadow-md" : "bg-transparent text-gray-800 dark:text-gray-200 px-0"
                      }`}>
                      {msg.text}
                    </div>
                    {msg.link && (
                      <Link href={`${msg.link.path}?open=${msg.link.index}`} onClick={() => setIsOpen(false)} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-[#2c2c2e] rounded-xl border border-[#5b42f3]/20 text-[#5b42f3] dark:text-[#7c66ff] text-xs font-bold hover:bg-[#5b42f3]/5 transition-colors group">
                        {msg.link.label}
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start animate-in fade-in duration-300">
                  <div className="bg-gray-100 dark:bg-[#2c2c2e] px-4 py-3 rounded-2xl rounded-tl-none flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className={`p-4 bg-transparent border-none flex items-end gap-2 relative transition-all duration-300 pb-5 sm:pb-4 ${isMaximized ? "max-w-4xl mx-auto w-full px-4 sm:px-0" : "w-full"}`}>
            <div className="relative flex-1 group">
              <textarea
                rows={1}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={`Pitajte bilo šta...`}
                className="w-full bg-gray-100 dark:bg-[#2c2c2e] border border-gray-100 dark:border-[#3c3c3e] outline-none px-6 py-4 pr-16 rounded-[32px] text-sm focus:ring-0 transition-all resize-none max-h-32 scrollbar-none shadow-sm"
                style={{ height: 'auto', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
              />
              <style jsx>{`
                textarea::-webkit-scrollbar { display: none; }
              `}</style>
              <button
                type="submit"
                disabled={!query.trim() || isTyping}
                className="absolute right-2.5 bottom-[13px] w-10 h-10 bg-[#5b42f3] hover:bg-[#4b35d6] text-white rounded-full flex items-center justify-center hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:scale-105 active:scale-95"
              >
                <ArrowUp size={18} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
