"use client";

import { useState } from "react";
import { Send, Mail } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isFocused, setIsFocused] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      await fetch(`https://formsubmit.co/ajax/support@galset.com`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          _subject: `Kontakt forma: ${formData.subject}`,
        }),
      });
      setSent(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      alert("Greška pri slanju. Pokušajte ponovo.");
    } finally {
      setSending(false);
    }
  };

  const floatingLabel = (field: string, label: string, hasValue: boolean) => (
    <label
      className={`absolute left-5 pointer-events-none bg-bg-1 px-1 transition-all
        ${isFocused === field || hasValue
          ? `-top-2 text-sm ${isFocused === field ? "text-[#6366f1]" : "text-gray-400"}`
          : "top-1/2 -translate-y-1/2 text-gray-400"
        }`}
    >
      {label}
    </label>
  );

  if (sent) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#6366f1]/10 flex items-center justify-center mx-auto mb-6">
          <Send size={28} className="text-[#6366f1]" />
        </div>
        <h1 className="text-2xl font-bold text-text-main mb-3">Poruka je poslata!</h1>
        <p className="text-gray-400 mb-8">Hvala vam. Odgovorićemo vam u najkraćem mogućem roku.</p>
        <button
          onClick={() => setSent(false)}
          className="px-8 py-3 bg-[#5b42f3] hover:bg-[#4b35d6] text-white font-semibold rounded-full transition-colors duration-200 cursor-pointer"
        >
          Pošalji novu poruku
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="pb-10">
        <h1 className="text-3xl font-bold text-text-main mb-2">
          Kontaktirajte nas
        </h1>
        <p className="text-gray-400 mb-10">
          Imate pitanje ili vam je potrebna tehnička podrška? Naš tim će vam odgovoriti u najkraćem mogućem roku.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
          {/* Ime */}
          <div className="relative">
            <input
              type="text"
              required
              placeholder=""
              className={`w-full px-5 py-4 rounded-full border bg-transparent text-text-main outline-none transition-all ${isFocused === "name" ? "border-[#6366f1]" : "border-bg-3"
                }`}
              value={formData.name}
              onFocus={() => setIsFocused("name")}
              onBlur={() => setIsFocused(null)}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {floatingLabel("name", "Ime", formData.name.length > 0)}
          </div>

          {/* Email */}
          <div className="relative">
            <input
              type="email"
              required
              placeholder=""
              className={`w-full px-5 py-4 rounded-full border bg-transparent text-text-main outline-none transition-all ${isFocused === "email" ? "border-[#6366f1]" : "border-bg-3"
                }`}
              value={formData.email}
              onFocus={() => setIsFocused("email")}
              onBlur={() => setIsFocused(null)}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {floatingLabel("email", "Email adresa", formData.email.length > 0)}
          </div>

          {/* Naslov */}
          <div className="relative">
            <input
              type="text"
              required
              placeholder=""
              className={`w-full px-5 py-4 rounded-full border bg-transparent text-text-main outline-none transition-all ${isFocused === "subject" ? "border-[#6366f1]" : "border-bg-3"
                }`}
              value={formData.subject}
              onFocus={() => setIsFocused("subject")}
              onBlur={() => setIsFocused(null)}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
            {floatingLabel("subject", "Naslov", formData.subject.length > 0)}
          </div>

          {/* Opis */}
          <div className="relative">
            <textarea
              required
              rows={5}
              placeholder=""
              className={`w-full px-5 py-4 rounded-3xl border bg-transparent text-text-main outline-none transition-all resize-none custom-modal-scrollbar ${isFocused === "message" ? "border-[#6366f1]" : "border-bg-3"
                }`}
              value={formData.message}
              onFocus={() => setIsFocused("message")}
              onBlur={() => setIsFocused(null)}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
            <label
              className={`absolute left-5 pointer-events-none bg-bg-1 px-1 transition-all
                ${isFocused === "message" || formData.message.length > 0
                  ? `-top-2 text-sm ${isFocused === "message" ? "text-[#6366f1]" : "text-gray-400"}`
                  : "top-4 text-gray-400"
                }`}
            >
              Opis
            </label>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={sending}
              className="w-full flex items-center justify-center py-4 bg-[#5b42f3] hover:bg-[#4b35d6] text-white font-bold rounded-full transition-colors duration-200 cursor-pointer disabled:opacity-60"
            >
              {sending ? "Slanje..." : "Pošalji"}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#6366f1]/10 flex items-center justify-center text-[#6366f1]">
            <Mail size={20} />
          </div>
          <div>
            <div className="text-sm font-medium text-text-main">Pišite nam direktno</div>
            <a href="mailto:support@galset.com" className="text-sm text-[#6366f1] hover:underline">
              support@galset.com
            </a>
          </div>
        </div>
        <div className="text-sm text-gray-400 text-center md:text-right">
          Obično odgovaramo u roku od 24h radnim danima.
        </div>
      </div>
    </div>
  );
}
