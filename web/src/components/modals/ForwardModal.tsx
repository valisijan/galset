"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

const UserAvatar = "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/assets/user-avatar.png?updatedAt=1776365714850";

type Conv = {
  id: string;
  name: string;
  avatar: string;
  adName: string;
  otherUserId: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  messageContent: string;
  currentUserId: number;
  currentChatId: string;
};

export default function ForwardModal({ isOpen, onClose, messageContent, currentUserId, currentChatId }: Props) {
  const { sessionToken } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [convs, setConvs] = useState<Conv[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => { setMounted(true); }, []);

  // Scroll lock + back button
  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState({ modal: "forward" }, "");

    const handlePopState = () => { onCloseRef.current(); };
    window.addEventListener("popstate", handlePopState);
    document.body.classList.add("lock-scroll");

    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.body.classList.remove("lock-scroll");
      if (window.history.state?.modal === "forward") {
        window.history.back();
      }
    };
  }, [isOpen]);

  // Fetch conversations when opened
  useEffect(() => {
    if (!isOpen) return;
    setSelected([]);
    setLoading(true);

    const headers: Record<string, string> = {};
    if (sessionToken) {
      headers["Authorization"] = `Bearer ${sessionToken}`;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/conversations`, { headers })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setConvs(
            data.conversations
              .filter((c: any) => c.id !== currentChatId)
              .map((c: any) => ({
                id: c.id,
                otherUserId: c.otherUser.id,
                name: c.otherUser.username || c.otherUser.fullName || "",
                avatar: c.otherUser.profileImg?.split("|||")[0] || UserAvatar,
                adName: c.ad?.title || "Opšti razgovor",
              }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen, currentChatId]);

  const toggle = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleForward = async () => {
    if (!selected.length) return;
    setSending(true);
    try {
      await Promise.all(
        selected.map(convId => {
          const conv = convs.find(c => c.id === convId);
          if (!conv) return Promise.resolve();
          return fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              senderId: currentUserId,
              receiverId: conv.otherUserId,
              conversationId: convId,
              content: messageContent,
            }),
          });
        })
      );
      const n = selected.length;
      toast.success(`Poruka prosleđena u ${n} razgovor${n > 1 ? "a" : ""}`);
      onClose();
    } catch {
      toast.error("Greška pri prosleđivanju");
    } finally {
      setSending(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-[400px] h-[540px] bg-bg-2 rounded-4xl z-[10100] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Centered Header */}
            <div className="pt-8 pb-2 text-center flex-shrink-0">
              <h3 className="text-text-main font-bold text-lg">Prosledi poruku</h3>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto py-2 px-6 mt-2 custom-modal-scrollbar">
              {loading ? (
                <div className="flex flex-col gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 w-full py-2.5 rounded-2xl animate-pulse">
                      <div className="w-11 h-11 rounded-full bg-bg-2 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-bg-2 rounded w-2/3" />
                        <div className="h-2 bg-bg-2 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : convs.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-10">Nema drugih razgovora</p>
              ) : (
                convs.map(conv => {
                  const isSel = selected.includes(conv.id);
                  return (
                    <button
                      key={conv.id}
                      onClick={() => toggle(conv.id)}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-2xl hover:bg-bg-3/50 transition-colors cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 relative">
                        <Image src={conv.avatar} alt={conv.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-text-main font-semibold text-sm truncate">{conv.adName}</p>
                        <p className="text-gray-400 text-xs truncate">{conv.name}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSel ? "border-[#6366f1] bg-[#5b42f3] hover:bg-[#4b35d6]" : "border-gray-500"}`}>
                        {isSel && <Check size={11} className="text-white" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Action Buttons */}
            <div className="w-full px-6 pb-6 pt-2 flex flex-col gap-3 flex-shrink-0">
              <button
                onClick={handleForward}
                disabled={!selected.length || sending}
                className="w-full py-3 rounded-full bg-[#5b42f3] hover:bg-[#4b35d6] text-white font-bold transition-all duration-200 cursor-pointer text-base disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                {sending ? "Prosleđivanje..." : "Prosledi"}
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-full bg-bg-3 hover:bg-bg-3/80 text-white font-medium transition-all duration-200 cursor-pointer text-base"
              >
                Otkaži
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
