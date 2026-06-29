"use client";

import { useState, useRef, useLayoutEffect, useEffect, Fragment, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Clock, MapPin, EllipsisVertical, X, Heart, Reply, Copy, Play, Pause, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import UserMoreModal from "@/components/modals/UserMoreModal";
import ForwardModal from "@/components/modals/ForwardModal";
import Loader from "@/components/Loader";
import MessageMoreMenu from "./MessageMoreMenu";
import UnblockUserModal from "@/components/modals/UnblockUserModal";
import DeleteMessageModal from "./DeleteMessageModal";
import AdCardList from "@/components/ads/AdCardList";
import ChatInput from "./ChatInput";

const UserAvatar = "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/assets/user-avatar.png";
const NoImage = "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/assets/no-image.png";

const formatDateLabel = (date: Date | string) => {
  const d = new Date(date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d >= today) return "Danas";
  if (d >= yesterday) return "Juče";

  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${day}.${month}.`;
};

const formatTime = (date: Date | string) => {
  return new Date(date).toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" });
};

const getWaveformBars = (msgId: string, count: number) => {
  let hash = 0;
  const idStr = String(msgId);
  for (let i = 0; i < idStr.length; i++) {
    hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
  }

  const bars = [];
  for (let i = 0; i < count; i++) {
    const pseudoRandom = Math.abs(Math.sin(hash + i)) * 16 + 8;
    bars.push(Math.round(pseudoRandom));
  }
  return bars;
};

const waveformCache: Record<string, number[]> = {};

const decodeAudioWaveform = async (url: string, count: number): Promise<number[]> => {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) throw new Error("Web Audio API not supported");

  const audioCtx = new AudioContextClass();
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  const channelData = audioBuffer.getChannelData(0);
  const blockSize = Math.floor(channelData.length / count);
  const peaks: number[] = [];

  for (let i = 0; i < count; i++) {
    const start = i * blockSize;
    let max = 0;
    for (let j = 0; j < blockSize; j++) {
      const val = Math.abs(channelData[start + j]);
      if (val > max) max = val;
    }
    peaks.push(max);
  }

  const maxPeak = Math.max(...peaks) || 1;
  const scaled = peaks.map(p => {
    return Math.round(6 + (p / maxPeak) * 18);
  });

  await audioCtx.close();
  return scaled;
};

function AudioWaveform({
  audioUrl,
  msgId,
  isMe,
  playbackProgress,
  isActive,
  count,
  isSending = false,
  onSeek
}: {
  audioUrl: string;
  msgId: string;
  isMe: boolean;
  playbackProgress: number;
  isActive: boolean;
  count: number;
  isSending?: boolean;
  onSeek?: (progress: number) => void;
}) {
  const [bars, setBars] = useState<number[]>(() => {
    return getWaveformBars(msgId, count);
  });

  useEffect(() => {
    if (isSending) return;
    if (audioUrl.startsWith("http")) {
      if (waveformCache[audioUrl]) {
        setBars(waveformCache[audioUrl]);
        return;
      }

      let active = true;
      const load = async () => {
        try {
          const decoded = await decodeAudioWaveform(audioUrl, count);
          if (active) {
            waveformCache[audioUrl] = decoded;
            setBars(decoded);
          }
        } catch (err) {
          console.warn("Waveform decoding failed, using fallback:", err);
        }
      };
      load();
      return () => { active = false; };
    }
  }, [audioUrl, count, msgId, isSending]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive || !onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progress = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(progress);
  };

  return (
    <div
      onClick={handleSeek}
      className={`flex items-center gap-[3px] h-8 py-1 select-none ${isActive ? "cursor-pointer" : ""}`}
    >
      {bars.map((height, i) => {
        const isPlayed = isActive && (i / count) <= playbackProgress;
        return (
          <div
            key={i}
            style={{
              height: `${height}px`,
              animationDelay: isSending ? `${i * 0.05}s` : undefined
            }}
            className={`w-[3px] rounded-full transition-all duration-150 ${isSending ? "bounce-bar" : ""
              } ${isMe
                ? (isPlayed ? "bg-white" : "bg-white/30")
                : (isPlayed ? "bg-[#5b42f3]" : "bg-gray-400/30")
              }`}
          />
        );
      })}
    </div>
  );
}

export default function ChatWindow({ chatId }: { chatId: string }) {
  const { user, sessionToken } = useAuth();

  // Audio playback state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);



  useEffect(() => {
    // Cleanup active audio on unmount or chat change
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setActiveAudioId(null);
    setIsAudioPlaying(false);
    setPlaybackTime(0);
    setPlaybackProgress(0);
  }, [chatId]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeekAudio = (progress: number, duration: number) => {
    if (audioRef.current) {
      const newTime = progress * (audioRef.current.duration || duration);
      audioRef.current.currentTime = newTime;
      setPlaybackTime(newTime);
      setPlaybackProgress(progress);
    }
  };

  const handleToggleSpeed = () => {
    let nextSpeed = 1;
    if (playbackSpeed === 1) nextSpeed = 1.5;
    else if (playbackSpeed === 1.5) nextSpeed = 2;
    else nextSpeed = 1;

    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handlePlayPause = (msgId: string, url: string, duration: number) => {
    if (activeAudioId === msgId) {
      if (audioRef.current) {
        if (isAudioPlaying) {
          audioRef.current.pause();
          setIsAudioPlaying(false);
          setPlaybackSpeed(1);
        } else {
          audioRef.current.playbackRate = playbackSpeed;
          audioRef.current.play()
            .then(() => setIsAudioPlaying(true))
            .catch(err => console.error("Playback failed:", err));
        }
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(url);
      audioRef.current = audio;
      // Apply the selected speed to the new Audio player
      audio.playbackRate = playbackSpeed;
      setActiveAudioId(msgId);
      setIsAudioPlaying(true);
      setPlaybackTime(0);
      setPlaybackProgress(0);

      audio.addEventListener('timeupdate', () => {
        setPlaybackTime(audio.currentTime);
        setPlaybackProgress(audio.currentTime / (audio.duration || duration || 1));
      });

      audio.addEventListener('ended', () => {
        setActiveAudioId(null);
        setIsAudioPlaying(false);
        setPlaybackTime(0);
        setPlaybackProgress(0);
        setPlaybackSpeed(1);
      });

      audio.addEventListener('pause', () => {
        setIsAudioPlaying(false);
        setPlaybackSpeed(1);
      });

      audio.addEventListener('play', () => {
        setIsAudioPlaying(true);
      });

      audio.play()
        .then(() => setIsAudioPlaying(true))
        .catch(err => {
          console.error("Playback start failed:", err);
          setActiveAudioId(null);
          setIsAudioPlaying(false);
          setPlaybackSpeed(1);
          toast.error("Nije moguće pustiti audio snimak.");
        });
    }
  };


  const [wishlistIds, setWishlistIds] = useState<number[]>([]);

  useEffect(() => {
    const checkWishlist = async () => {
      if (!user) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist`);
        const data = await res.json();
        if (data.success) {
          setWishlistIds(data.ads.map((a: any) => a.id));
        }
      } catch (err) {
        console.error("Failed to check wishlist:", err);
      }
    };
    checkWishlist();
  }, [user]);

  const handleWishlistToggle = async (adId: number) => {
    if (!user) {
      window.dispatchEvent(new Event("open-auth-modal"));
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.action === "added") {
          setWishlistIds(prev => [...prev, adId]);
          toast.success("Dodato u listu želja");
        } else {
          setWishlistIds(prev => prev.filter(id => id !== adId));
          toast.success("Uklonjeno iz liste želja");
        }
        window.dispatchEvent(new Event("wishlistUpdate"));
      }
    } catch (err) {
      toast.error("Greška pri ažuriranju liste želja");
    }
  };

  const [message, setMessage] = useState("");
  const [viewportHeight, setViewportHeight] = useState("100%");

  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const showScrollBottomRef = useRef(false);
  const [unreadBelowCount, setUnreadBelowCount] = useState(0);
  const countedMessageIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    showScrollBottomRef.current = showScrollBottom;
  }, [showScrollBottom]);

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [originalMessageContent, setOriginalMessageContent] = useState<string | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<any | null>(null);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; content: string; senderId: number } | null>(null);
  const [highlightMsgId, setHighlightMsgId] = useState<string | number | null>(null);
  const [activeMessageMenu, setActiveMessageMenu] = useState<any>(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardMessageContent, setForwardMessageContent] = useState("");
  const [menuDirection, setMenuDirection] = useState<"top" | "bottom">("top");

  const [showMenu, setShowMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);

  const [linkPreviews, setLinkPreviews] = useState<Record<string, { title: string; image: string; url: string; error?: boolean; loading?: boolean }>>({});
  const pendingRequestsRef = useRef<Set<string>>(new Set());

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const scrollHeightBeforeRef = useRef<number | null>(null);
  const isLoadingOlderMessagesRef = useRef(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [chat, setChat] = useState<any[]>([]);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [currentAd, setCurrentAd] = useState<any>(null);
  const [blockStatus, setBlockStatus] = useState<{ isBlockedByMe: boolean; amIBlocked: boolean } | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    checkMobile();
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.body.classList.add("hide-bottom-nav");

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.classList.remove("hide-bottom-nav");
    };
  }, []);

  const fetchHistory = async (cursor?: string, silent?: boolean) => {
    if (!chatId) return;
    if (cursor) setLoadingMore(true);
    else if (!silent) setLoading(true);

    try {
      const limit = 20;
      const url = `${process.env.NEXT_PUBLIC_API_URL}/messages/history?conversationId=${chatId}${cursor ? `&cursor=${cursor}` : ""}&limit=${limit}`;
      const headers: Record<string, string> = {};
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`;
      }
      const res = await fetch(url, { headers });
      const data = await res.json();

      if (data.success) {
        const newMessages = data.messages;
        setHasMore(newMessages.length === limit);

        if (cursor) {
          const scrollContainer = messagesRef.current;
          if (scrollContainer) {
            scrollHeightBeforeRef.current = scrollContainer.scrollHeight;
          }

          setChat(prev => [...newMessages, ...prev]);
        } else {
          setChat(newMessages);

          if (data.conversation && user) {
            const partner = Number(data.conversation.user1Id) === Number(user.id) ? data.conversation.user2 : data.conversation.user1;
            setOtherUser({
              ...partner,
              name: partner.username || partner.fullName
            });
            setCurrentAd(data.conversation.ad);
            try {
              const blockRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/block/status?userId=${partner.id}`, { headers });
              const blockData = await blockRes.json();
              if (blockData.success) {
                setBlockStatus({
                  isBlockedByMe: blockData.isBlockedByMe,
                  amIBlocked: blockData.amIBlocked,
                });
              }
            } catch (e) {
            }
          }
        }
      } else if (res.status === 404 || res.status === 403) {
        window.location.href = "/not-found";
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setTimeout(() => {
        isLoadingOlderMessagesRef.current = false;
      }, 300);
    }
  };

  useEffect(() => {
    if (user && chatId) {
      setChat([]);
      setUnreadBelowCount(0);
      countedMessageIdsRef.current.clear();
      fetchHistory(undefined, false);
    }
  }, [chatId, user?.id]);

  const loadOlderMessages = () => {
    if (chat.length > 0 && hasMore && !loadingMore) {
      isLoadingOlderMessagesRef.current = true;
      fetchHistory(chat[0].id.toString());
    }
  };

  useEffect(() => {
    if (!chatId) return;

    setIsOtherUserTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    const appendMessage = (newMsg: any) => {
      const strId = String(newMsg.id);

      const alreadyExists = chat.some((m) => m.id === strId || m.id === `temp-${strId}`);
      if (alreadyExists) return;

      const wasScrolledUp = showScrollBottomRef.current;
      const isMyMessage = Number(newMsg.senderId) === Number(user?.id);

      if (wasScrolledUp && !isMyMessage && !countedMessageIdsRef.current.has(strId)) {
        countedMessageIdsRef.current.add(strId);
        setUnreadBelowCount((c) => c + 1);
      }

      setChat((prev) => {
        const replyToIdVal = newMsg.replyToId || newMsg.replytoid || newMsg.reply_to_id;
        const replyToContentVal = newMsg.replyToContent || newMsg.replytocontent || newMsg.reply_to_content;

        if (prev.find((m) => m.id === strId || m.id === `temp-${strId}`)) return prev;

        if (isMyMessage) {
          const tempIdx = prev.findIndex((m) => m.id.startsWith("temp-") && m.content === newMsg.content);
          if (tempIdx !== -1) {
            const updated = [...prev];
            updated[tempIdx] = {
              ...newMsg,
              id: strId,
              replyToId: replyToIdVal ? String(replyToIdVal) : null,
              replyToContent: replyToContentVal || null,
            };
            return updated;
          }
        }

        return [...prev, {
          ...newMsg,
          id: strId,
          replyToId: replyToIdVal ? String(replyToIdVal) : null,
          replyToContent: replyToContentVal || null,
        }];
      });

      if (isMyMessage || !wasScrolledUp) {
        setTimeout(scrollToBottom, 50);
      }
    };

    const broadcastChannel = supabase
      .channel(`chat:${chatId}`)
      .on('broadcast', { event: 'newMessage' }, ({ payload }: { payload: any }) => {
        console.log(`[ChatWindow] Broadcast 'newMessage' received for chat: ${chatId}`, payload);
        appendMessage(payload);
        window.dispatchEvent(new Event("unreadUpdate"));
      })
      .on('broadcast', { event: 'messageEdited' }, ({ payload }: { payload: any }) => {
        console.log(`[ChatWindow] Broadcast 'messageEdited' received:`, payload);
        const strId = String(payload.id);
        setChat(prev => prev.map(m => m.id === strId ? { ...m, content: payload.content, editedAt: payload.editedAt } : m));
      })
      .on('broadcast', { event: 'messageDeleted' }, ({ payload }: { payload: any }) => {
        console.log(`[ChatWindow] Broadcast 'messageDeleted' received:`, payload);
        const strId = String(payload.id);
        setChat(prev => prev.filter(m => m.id !== strId));
      })
      .on('broadcast', { event: 'messagesRead' }, ({ payload }: { payload: any }) => {
        console.log(`[ChatWindow] Broadcast 'messagesRead' received:`, payload);
        const readIds = payload.messageIds.map((id: any) => String(id));
        setChat(prev => prev.map(m => {
          if (readIds.includes(m.id)) {
            return { ...m, readAt: payload.readAt };
          }
          return m;
        }));
      })
      .on('broadcast', { event: 'typing' }, ({ payload }: { payload: any }) => {
        console.log(`[ChatWindow] Broadcast 'typing' received:`, payload);
        if (Number(payload.userId) !== Number(user?.id)) {
          setIsOtherUserTyping(payload.isTyping);

          if (payload.isTyping) {
            const el = messagesRef.current;
            if (el) {
              const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
              if (isNearBottom) {
                setTimeout(scrollToBottom, 50);
              }
            }
          }

          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          if (payload.isTyping) {
            typingTimeoutRef.current = setTimeout(() => {
              setIsOtherUserTyping(false);
            }, 4000);
          }
        }
      })
      .subscribe((status: string) => {
        console.log(`[ChatWindow] Broadcast channel 'chat:${chatId}' status:`, status);
      });

    channelRef.current = broadcastChannel;

    const handleNewMessage = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newMsg = customEvent.detail;
      const msgConversationId = newMsg.conversationId || newMsg.conversationid || newMsg.conversation_id;

      console.log(`[ChatWindow] Window event 'newMessage' received. Msg conversationId: ${msgConversationId}, chatId: ${chatId}`);

      if (!msgConversationId || String(msgConversationId).toLowerCase() !== String(chatId).toLowerCase()) {
        return;
      }
      appendMessage(newMsg);
    };

    const handleMessageUpdated = (e: Event) => {
      const customEvent = e as CustomEvent;
      const updatedMsg = customEvent.detail;
      const msgConversationId = updatedMsg.conversationId || updatedMsg.conversationid || updatedMsg.conversation_id;

      if (!msgConversationId || String(msgConversationId).toLowerCase() !== String(chatId).toLowerCase()) {
        return;
      }

      const strId = String(updatedMsg.id);
      setChat(prev => prev.map(m => m.id === strId ? {
        ...m,
        readAt: updatedMsg.readAt ?? updatedMsg.readat ?? updatedMsg.read_at,
        likedAt: updatedMsg.likedAt ?? updatedMsg.likedat ?? updatedMsg.liked_at,
      } : m));
    };

    window.addEventListener("newMessage", handleNewMessage);
    window.addEventListener("messageUpdated", handleMessageUpdated);

    return () => {
      supabase.removeChannel(broadcastChannel);
      window.removeEventListener("newMessage", handleNewMessage);
      window.removeEventListener("messageUpdated", handleMessageUpdated);
    };
  }, [chatId]);

  useEffect(() => {
    if (!user?.id || !chatId || chat.length === 0) return;

    const markAsRead = async () => {
      const unreadIds = chat
        .filter(m => Number(m.senderId) !== Number(user?.id) && !m.readAt)
        .map(m => m.id);

      if (unreadIds.length > 0) {
        const senderOfUnread = chat.find(m => unreadIds.includes(m.id))?.senderId;
        const targetUserId = senderOfUnread || otherUser?.id;
        if (!targetUserId) return;
        window.dispatchEvent(new Event("unreadUpdate"));

        try {
          const headers: Record<string, string> = { "Content-Type": "application/json" };
          if (sessionToken) {
            headers["Authorization"] = `Bearer ${sessionToken}`;
          }
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/read`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              senderId: user.id,
              otherUserId: targetUserId,
              messageIds: unreadIds
            })
          });
          setChat(prev => prev.map(m => {
            if (unreadIds.includes(m.id)) {
              return { ...m, readAt: new Date().toISOString() };
            }
            return m;
          }));
        } catch (err) {
          console.error("Failed to mark read", err);
        }
      }
    };

    markAsRead();
  }, [chatId, user?.id, chat.length, otherUser?.id, sessionToken]);

  const handleBlockConfirm = async () => {
    if (!otherUser) return;
    setBlockLoading(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`;
      }
      if (blockStatus?.isBlockedByMe) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/block`, {
          method: "DELETE",
          headers,
          body: JSON.stringify({ blockedId: otherUser.id })
        });
        const data = await res.json();
        if (data.success) {
          setBlockStatus(prev => prev ? { ...prev, isBlockedByMe: false } : null);
          toast.success(`Korisnik ${otherUser.username} je odblokiran`);
        } else {
          toast.error("Greška pri odblokiranju");
        }
      } else {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/block`, {
          method: "POST",
          headers,
          body: JSON.stringify({ blockedId: otherUser.id })
        });
        const data = await res.json();
        if (data.success) {
          setBlockStatus(prev => prev ? { ...prev, isBlockedByMe: true } : null);
          toast.success(`Korisnik ${otherUser.username} je blokiran`);
        } else {
          toast.error("Greška pri blokiranju");
        }
      }
    } catch (e) {
      toast.error("Greška, pokušajte ponovo");
    } finally {
      setBlockLoading(false);
    }
  };

  const handleShare = async () => {
    if (typeof window === "undefined" || !otherUser) return;
    const url = `${window.location.origin}/${otherUser.username}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: otherUser.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link kopiran!");
      }
    } catch (e) { }
  };


  const scrollToBottom = useCallback((smooth = false) => {
    if (messagesRef.current) {
      if (smooth) {
        messagesRef.current.scrollTo({
          top: messagesRef.current.scrollHeight,
          behavior: "smooth"
        });
      } else {
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      }
    }
    setUnreadBelowCount(0);
    countedMessageIdsRef.current.clear();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      const originalScrollRestoration = window.history.scrollRestoration;
      window.history.scrollRestoration = "manual";
      return () => {
        window.history.scrollRestoration = originalScrollRestoration;
      };
    }
  }, []);

  useEffect(() => {
    const messagesEl = messagesRef.current;
    const contentEl = contentRef.current;
    if (!messagesEl || !contentEl) return;

    let isInitial = true;
    let lastScrollHeight = messagesEl.scrollHeight;

    const timer = setTimeout(() => {
      isInitial = false;
    }, 500);

    const observer = new ResizeObserver(() => {
      if (isLoadingOlderMessagesRef.current) {
        lastScrollHeight = messagesEl.scrollHeight;
        return;
      }
      const currentScrollHeight = messagesEl.scrollHeight;
      const distanceFromBottomBefore = lastScrollHeight - messagesEl.scrollTop - messagesEl.clientHeight;

      if (isInitial || distanceFromBottomBefore < 150) {
        messagesEl.scrollTop = currentScrollHeight;
      }
      lastScrollHeight = currentScrollHeight;
    });

    observer.observe(contentEl);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [chatId, loading]);

  useLayoutEffect(() => {
    if (scrollHeightBeforeRef.current !== null && messagesRef.current) {
      const scrollContainer = messagesRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight - scrollHeightBeforeRef.current;
      scrollHeightBeforeRef.current = null;
    }
  }, [chat]);

  useEffect(() => {
    if (!loading && chatId) {
      const timers = [50, 150, 300].map(delay =>
        setTimeout(scrollToBottom, delay)
      );
      return () => timers.forEach(clearTimeout);
    }
  }, [loading, chatId]);

  useEffect(() => {
    if (!loading && !isMobile && chatId) {
      textareaRef.current?.focus();
    }
  }, [loading, isMobile, chatId]);

  const sendTypingStatus = useCallback((typing: boolean) => {
    if (channelRef.current && user?.id) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: user.id, isTyping: typing }
      });
    }
  }, [user?.id]);

  const handleLike = async (msgId: string) => {
    if (String(msgId).startsWith("temp-")) return;

    setChat(prev => prev.map(m =>
      m.id === msgId
        ? { ...m, likedAt: m.likedAt ? null : new Date().toISOString() }
        : m
    ));

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`;
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/like`, {
        method: "POST",
        headers,
        body: JSON.stringify({ messageId: msgId }),
      });
      const data = await res.json();
      if (!data.success) {
        setChat(prev => prev.map(m =>
          m.id === msgId
            ? { ...m, likedAt: m.likedAt ? null : new Date().toISOString() }
            : m
        ));
      }
    } catch {
      setChat(prev => prev.map(m =>
        m.id === msgId
          ? { ...m, likedAt: m.likedAt ? null : new Date().toISOString() }
          : m
      ));
    }
  };



  const confirmDeleteMessage = async () => {
    if (!deletingMessage) return;
    const msgId = deletingMessage.id;
    const content = deletingMessage.content;
    setDeletingMessage(null);

    setChat(prev => prev.filter(m => m.id !== msgId));

    try {
      const headers: Record<string, string> = {};
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`;
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/delete/${msgId}`, {
        method: "DELETE",
        headers
      });
      const data = await res.json();
      if (!data.success) {
        toast.error("Greška pri brisanju poruke");
        fetchHistory(undefined, true);
      } else {
        toast.success("Poruka je obrisana");
      }
    } catch (err) {
      console.error("Delete message request failed:", err);
      toast.error("Greška pri brisanju poruke");
      fetchHistory(undefined, true);
    }
  };

  const handleCopyMessage = (msg: any) => {
    setActiveMessageMenu(null);
    navigator.clipboard.writeText(msg.content);
    toast.success("Poruka uspesno kopirana");
  };

  const scrollToMessage = (msgId: string | number) => {
    const el = document.getElementById("msg-" + msgId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightMsgId(msgId);
      setTimeout(() => setHighlightMsgId(null), 3000);
    }
  };

  const menuOptions = [
    { name: "Slika", icon: "image.svg", onClick: () => { } },
    ...(isMobile ? [{ name: "Kamera", icon: "camera.svg", onClick: () => { } }] : []),
    { name: "Datoteka", icon: "file.svg", onClick: () => setShowMenu(false) },
    { name: "Lokacija", icon: "location.svg", onClick: () => setShowMenu(false) },
    { name: "Oglas", icon: "ad.svg", onClick: () => setShowMenu(false) },
  ];



  useEffect(() => {
    const handleViewportChange = () => {
      if (window.visualViewport) {
        const height = window.visualViewport.height;
        const isCurrentlyMobile = window.innerWidth < 768;
        setViewportHeight(isCurrentlyMobile ? `${height - 50}px` : `${height}px`);
      }
    };
    window.visualViewport?.addEventListener("resize", handleViewportChange);
    window.visualViewport?.addEventListener("scroll", handleViewportChange);
    handleViewportChange();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleViewportChange);
        window.visualViewport.removeEventListener("scroll", handleViewportChange);
      }
    };
  }, []);



  const getRadiusClass = (index: number) => {
    const current = chat[index];
    const prev = chat[index - 1];
    const next = chat[index + 1];
    const isSameAsPrev = prev && Number(prev.senderId) === Number(current.senderId);
    const isSameAsNext = next && Number(next.senderId) === Number(current.senderId);

    if (Number(current.senderId) === Number(user?.id)) {
      if (!isSameAsPrev && !isSameAsNext) return "rounded-[20px]";
      if (!isSameAsPrev && isSameAsNext) return "rounded-[20px] rounded-br-[5px]";
      if (isSameAsPrev && isSameAsNext) return "rounded-l-[20px] rounded-r-[5px]";
      if (isSameAsPrev && !isSameAsNext) return "rounded-[20px] rounded-tr-[5px]";
    } else {
      if (!isSameAsPrev && !isSameAsNext) return "rounded-[20px]";
      if (!isSameAsPrev && isSameAsNext) return "rounded-[20px] rounded-bl-[5px]";
      if (isSameAsPrev && isSameAsNext) return "rounded-r-[20px] rounded-l-[5px]";
      if (isSameAsPrev && !isSameAsNext) return "rounded-[20px] rounded-tl-[5px]";
    }
    return "rounded-[20px]";
  };

  const getRelativeTimeLabel = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMin < 1) return "sada";
    if (diffMin < 60) return `pre ${diffMin}m`;
    if (diffHours < 23) return `pre ${diffHours}h`;
    if (diffHours < 47) return "juče";
    return "";
  };

  const getLastMessageStatus = () => {
    const lastMsg = chat[chat.length - 1];
    if (!lastMsg || Number(lastMsg.senderId) !== Number(user?.id)) return null;

    if (String(lastMsg.id).startsWith("temp-")) return "Šalje se...";
    if (lastMsg.readAt) {
      const label = getRelativeTimeLabel(lastMsg.readAt);
      return label ? `Vidjeno ${label}` : "Vidjeno";
    }
    const label = getRelativeTimeLabel(lastMsg.createdAt);
    return label ? `Poslato ${label}` : "Poslato";
  };

  const statusText = getLastMessageStatus();

  const normalizeUrl = (urlStr: string) => {
    if (urlStr.match(/^https?:\/\//i)) return urlStr;
    return 'https://' + urlStr;
  };

  const getHostname = (urlStr: string) => {
    try {
      return new URL(normalizeUrl(urlStr)).hostname;
    } catch {
      return urlStr;
    }
  };

  useEffect(() => {
    if (chat.length === 0) return;

    const urls: string[] = [];
    chat.forEach(msg => {
      if (msg.content) {
        const matches = msg.content.match(/(https?:\/\/[^\s]+|(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi);
        if (matches) {
          matches.forEach((u: string) => {
            const idx = msg.content.indexOf(u);
            if (idx > 0 && msg.content[idx - 1] === '@') {
              return;
            }
            if (u.match(/^\d+\.\d+$/)) {
              return;
            }
            if (!urls.includes(u)) urls.push(u);
          });
        }
      }
    });

    urls.forEach(urlStr => {
      const normalized = normalizeUrl(urlStr);
      if (!linkPreviews[urlStr] && !pendingRequestsRef.current.has(urlStr)) {
        pendingRequestsRef.current.add(urlStr);
        setLinkPreviews(prev => ({
          ...prev,
          [urlStr]: { title: '', image: '', url: urlStr, loading: true }
        }));

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/link-preview?url=${encodeURIComponent(normalized)}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setLinkPreviews(prev => ({
                ...prev,
                [urlStr]: { title: data.title, image: data.image, url: urlStr, loading: false }
              }));
            } else {
              setLinkPreviews(prev => ({
                ...prev,
                [urlStr]: { title: getHostname(urlStr), image: '', url: urlStr, error: true, loading: false }
              }));
            }
          })
          .catch(() => {
            setLinkPreviews(prev => ({
              ...prev,
              [urlStr]: { title: getHostname(urlStr), image: '', url: urlStr, error: true, loading: false }
            }));
          });
      }
    });
  }, [chat, linkPreviews]);

  const renderMessageContent = (msg: any, isMe: boolean) => {
    const content = msg.content;
    if (!content) return null;

    // Provera da li je audio poruka u toku uploada
    if (content.startsWith('[AUDIO:loading|')) {
      const audioDurationSec = Number(content.split('|')[1].replace(']', ''));
      const count = Math.min(22, Math.max(10, Math.round(10 + (audioDurationSec / 60) * 12)));
      return (
        <div className="flex items-center gap-3 py-1 select-none">
          {/* Play/Pause Button (shows disabled Play button) */}
          {isMe ? (
            <button
              disabled
              className="w-8 h-8 rounded-full bg-white text-[#5b42f3] flex items-center justify-center shrink-0 opacity-70 cursor-not-allowed"
              type="button"
            >
              <Play size={14} className="fill-[#5b42f3] text-[#5b42f3] ml-[2px]" />
            </button>
          ) : (
            <button
              disabled
              className="w-8 h-8 rounded-full bg-[#5b42f3] text-white flex items-center justify-center shrink-0 opacity-70 cursor-not-allowed"
              type="button"
            >
              <Play size={14} className="fill-white text-white ml-[2px]" />
            </button>
          )}

          {/* Waveform Lines */}
          <AudioWaveform
            audioUrl=""
            msgId={msg.id}
            isMe={isMe}
            playbackProgress={0}
            isActive={false}
            count={count}
            isSending={true}
          />

          {/* Timer Label */}
          <span className={`text-[11px] font-semibold min-w-[32px] text-right shrink-0 tabular-nums ${isMe ? "text-white/80" : "text-gray-400"}`}>
            {formatTimer(audioDurationSec)}
          </span>
        </div>
      );
    }

    // Provera da li je regularna audio poruka
    const audioMatch = content.match(/^\[AUDIO:(.+?)\|(\d+)\]$/);
    if (audioMatch) {
      const audioUrl = audioMatch[1];
      const audioDurationSec = Number(audioMatch[2]);
      const isPlaying = activeAudioId === msg.id && isAudioPlaying;
      const count = Math.min(22, Math.max(10, Math.round(10 + (audioDurationSec / 60) * 12)));

      return (
        <div className="flex items-center gap-3 py-1 select-none">
          {/* Play/Pause Button */}
          {isMe ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause(msg.id, audioUrl, audioDurationSec);
              }}
              className="w-8 h-8 rounded-full bg-white text-[#5b42f3] flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 transition-transform"
              type="button"
            >
              {isPlaying ? <Pause size={14} className="fill-[#5b42f3] text-[#5b42f3]" /> : <Play size={14} className="fill-[#5b42f3] text-[#5b42f3] ml-[2px]" />}
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause(msg.id, audioUrl, audioDurationSec);
              }}
              className="w-8 h-8 rounded-full bg-[#5b42f3] text-white flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 transition-transform"
              type="button"
            >
              {isPlaying ? <Pause size={14} className="fill-white text-white" /> : <Play size={14} className="fill-white text-white ml-[2px]" />}
            </button>
          )}

          {/* Waveform Lines */}
          <AudioWaveform
            audioUrl={audioUrl}
            msgId={msg.id}
            isMe={isMe}
            playbackProgress={playbackProgress}
            isActive={activeAudioId === msg.id}
            count={count}
            onSeek={(progress) => handleSeekAudio(progress, audioDurationSec)}
          />

          {/* Timer and Speed Column */}
          <div className="flex flex-col items-end justify-center min-w-[36px] shrink-0 gap-0.5 self-center">
            {/* Timer Label */}
            <span className={`text-[11px] font-semibold tabular-nums ${isMe ? "text-white/80" : "text-gray-400"} ${isPlaying ? "-translate-y-[2px] transition-transform duration-200" : ""}`}>
              {activeAudioId === msg.id ? formatTimer(Math.round(playbackTime)) : formatTimer(audioDurationSec)}
            </span>

            {/* Speed Button */}
            {isPlaying && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleSpeed();
                }}
                className={`text-[9px] font-black px-1.5 py-0.5 rounded-full cursor-pointer transition-all active:scale-90 select-none ${isMe
                  ? "bg-white/20 text-white hover:bg-white/30"
                  : "bg-bg-3 text-text-main hover:bg-bg-4 border border-bg-4"
                  }`}
              >
                {playbackSpeed}x
              </button>
            )}
          </div>
        </div>
      );
    }

    const parts = content.split(/(https?:\/\/[^\s]+|(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi);
    const matches = content.match(/(https?:\/\/[^\s]+|(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi);
    const uniqueMatches = Array.from(new Set(matches || [])).filter((u: any) => {
      const idx = content.indexOf(u);
      if (idx > 0 && content[idx - 1] === '@') return false;
      if (u.match(/^\d+\.\d+$/)) return false;
      return true;
    });

    return (
      <div className="flex flex-col gap-2">
        {uniqueMatches.map((urlStr: any, idx: number) => {
          const preview = linkPreviews[urlStr];
          if (!preview || preview.loading) {
            return (
              <div key={`loader-${idx}`} className={`p-2.5 rounded-xl border flex flex-col gap-1.5 animate-pulse min-w-[200px] max-w-full ${isMe ? "bg-white/10 border-white/20" : "bg-bg-3 border-bg-4"
                }`}>
                <div className="h-3 w-2/3 bg-gray-400/50 rounded" />
                <div className="h-2 w-1/2 bg-gray-400/30 rounded" />
              </div>
            );
          }

          if (preview.error || (!preview.title && !preview.image)) {
            return null;
          }

          return (
            <a
              key={`preview-${idx}`}
              href={normalizeUrl(preview.url)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`block rounded-2xl overflow-hidden border max-w-full no-underline transition-colors ${isMe
                ? "bg-white/10 border-white/20 text-white hover:text-white"
                : "bg-bg-3 border-bg-4 text-text-main hover:text-text-main"
                }`}
            >
              {preview.image && (
                <div className="w-full h-auto max-h-[250px] md:max-h-[320px] bg-black/5 border-b border-black/10 flex items-center justify-center overflow-hidden">
                  <img
                    src={preview.image}
                    alt={preview.title}
                    className="w-full h-auto max-h-[250px] md:max-h-[320px] object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="p-3 flex flex-col gap-0.5 select-none">
                <span className="font-bold text-[14px] leading-tight line-clamp-2">
                  {preview.title}
                </span>
                <span className={`text-[11px] truncate ${isMe ? "text-white/60" : "text-gray-400"}`}>
                  {getHostname(preview.url)}
                </span>
              </div>
            </a>
          );
        })}

        <p className="m-0 break-words">
          {parts.map((part: any, i: any) => {
            const isUrl = part.match(/^(https?:\/\/[^\s]+|(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)$/i);
            const isEmailDomain = i > 0 && parts[i - 1].endsWith('@');
            const isNumber = part.match(/^\d+\.\d+$/);
            if (isUrl && !isEmailDomain && !isNumber) {
              const urlWithProtocol = normalizeUrl(part);
              const prevPart = parts[i - 1];
              const nextPart = parts[i + 1];
              const needsPrevBr = prevPart && prevPart.trim() !== "" && !/\n\s*$/.test(prevPart);
              const needsNextBr = nextPart && nextPart.trim() !== "" && !/^\s*\n/.test(nextPart);

              return (
                <Fragment key={i}>
                  {needsPrevBr && <br />}
                  <a
                    href={urlWithProtocol}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={`underline break-all transition-colors ${isMe
                      ? "text-white hover:text-white/80 font-semibold"
                      : "text-blue-500 hover:text-blue-600 font-semibold"
                      }`}
                  >
                    {part}
                  </a>
                  {needsNextBr && <br />}
                </Fragment>
              );
            }
            return part;
          })}
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full overflow-hidden bg-bg-1 font-sans relative" style={{ height: viewportHeight }}>

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-bg-1 via-bg-1/95 to-transparent pt-4 pb-14 z-50 pointer-events-none">
        <div
          className="bg-bg-2 border border-bg-3 rounded-3xl cursor-pointer transition-all duration-300 mx-4 shadow-md pointer-events-auto"
          onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
        >
          <div className="p-3.5 pr-4">
            <div className="flex justify-between items-center">
              {loading ? (
                // SKELETON FOR USER INFO
                <div className="flex items-center gap-3 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-bg-3 border border-bg-4 shrink-0" />
                  <div className="flex flex-col gap-1.5">
                    {isHeaderExpanded && (
                      <div className="h-2.5 w-16 bg-bg-3 rounded" />
                    )}
                    <div className="h-3.5 w-24 bg-bg-3 rounded" />
                  </div>
                </div>
              ) : (
                // NORMAL USER INFO
                <div className="flex items-center gap-3 z-10">
                  <div
                    className="w-12 h-12 rounded-full bg-bg-1 overflow-hidden relative border border-bg-3 shrink-0 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (otherUser?.username) window.location.href = `/${otherUser.username}`;
                    }}
                  >
                    <img src={otherUser?.profileImg?.split("|||")[0] || UserAvatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    {currentAd && !isHeaderExpanded && (
                      <p
                        className="text-text-main text-[11px] font-bold truncate max-w-[150px] md:max-w-[300px] leading-tight mb-1"
                      >
                        {currentAd.title}
                      </p>
                    )}
                    <div className="flex flex-col">
                      <p
                        className={`text-text-main font-bold text-sm leading-tight ${otherUser?.username ? 'cursor-pointer' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (otherUser?.username) window.location.href = `/${otherUser.username}`;
                        }}
                      >
                        {otherUser?.username || "Korisnik"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                {!loading && (
                  <AnimatePresence mode="wait">
                    {isHeaderExpanded && (
                      <motion.div
                        key="rate-button-group"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 z-10"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowOptionsModal(true);
                          }}
                          className="flex items-center justify-center bg-bg-3 hover:bg-bg-4 text-text-main rounded-full transition-colors cursor-pointer w-8 h-8"
                        >
                          <EllipsisVertical size={16} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform duration-300 ${isHeaderExpanded ? "rotate-180" : ""}`}
                />
              </div>
            </div>

            <AnimatePresence>
              {isHeaderExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  {loading ? (
                    <div className="pt-2 pb-0 px-0 animate-pulse flex gap-4 pointer-events-none">
                      <div className="w-32 h-24 bg-bg-3 rounded-2xl shrink-0" />
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div className="space-y-2">
                          <div className="h-4 bg-bg-3 rounded w-3/4" />
                          <div className="h-4 bg-bg-3 rounded w-1/4" />
                        </div>
                        <div className="space-y-1.5">
                          <div className="h-3 bg-bg-3 rounded w-1/2" />
                          <div className="h-3 bg-bg-3 rounded w-1/3" />
                        </div>
                      </div>
                    </div>
                  ) : currentAd ? (
                    <div className="pt-2 pb-1 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                      <AdCardList
                        ad={currentAd}
                        isWishlisted={wishlistIds.includes(currentAd.id)}
                        onWishlistToggle={handleWishlistToggle}
                        currentUser={user}
                        noBorder={true}
                        noHover={true}
                        noPadding={true}
                      />
                    </div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>


      {/* MESSAGES AREA */}
      <div
        ref={messagesRef}
        style={{ overscrollBehavior: "contain", overflowAnchor: "none" }}
        onClick={() => { if (activeMessageMenu) setActiveMessageMenu(null); }}
        onScroll={(e) => {
          if (activeMessageMenu) setActiveMessageMenu(null);
          const el = e.currentTarget;
          if (el.scrollTop < 100 && hasMore && !loadingMore) {
            loadOlderMessages();
          }
          const isScrollUp = el.scrollHeight - el.scrollTop - el.clientHeight > 150;
          setShowScrollBottom(isScrollUp);
          if (!isScrollUp) {
            setUnreadBelowCount(0);
            countedMessageIdsRef.current.clear();
          }
        }}
        className="absolute inset-0 overflow-y-auto px-4 pt-28 pb-24 flex flex-col bg-bg-1 scrollbar-hide"
      >
        {loading ? (
          <div className="flex-1" />
        ) : (
          <div ref={contentRef} className="flex flex-col w-full">
            {hasMore && loadingMore && (
              <div className="flex justify-center py-4">
                <Loader />
              </div>
            )}
            {!hasMore && (
              <div className="flex justify-center mb-6 mt-4 opacity-90">
                <div className="px-5 py-2.5 rounded-3xl bg-bg-2 border border-bg-3 max-w-[260px] text-center">
                  <p className="text-text-main/50 text-[11px] font-medium leading-relaxed">
                    Vaše poruke su privatne i bezbedne uz Galset zaštitu.
                  </p>
                </div>
              </div>
            )}
            {chat.map((msg, index) => {
              const isMe = Number(msg.senderId) === Number(user?.id);
              const isLast = index === chat.length - 1;
              const prevMsg = chat[index - 1];
              const nextMsg = chat[index + 1];
              const isLastInBlock = nextMsg && Number(nextMsg.senderId) !== Number(msg.senderId);

              const showDateSeparator = !prevMsg ||
                new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();

              return (
                <Fragment key={msg.id}>
                  {showDateSeparator && (
                    <div className="flex justify-center mb-6 mt-4">
                      <div className="px-4 py-1.5 rounded-full bg-bg-2 border border-bg-3">
                        <p className="text-text-main text-[11px] font-medium opacity-90">
                          {formatDateLabel(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}
                  <div id={`msg-${msg.id}`} className={`flex flex-col ${isMe ? "items-end" : "items-start"} mb-1`}>
                    {/* Message row */}
                    <div className={`flex items-center gap-1.5 group w-full ${isMe ? "justify-end" : "justify-start"}`}>
                      {/* For my messages: hover actions on LEFT of bubble */}
                      {isMe && (
                        <div className="relative flex items-center gap-0.5 flex-shrink-0 transition-opacity duration-150 opacity-100">
                          <button
                            onClick={() => { setReplyTo({ id: msg.id, content: msg.content, senderId: msg.senderId }); setTimeout(() => textareaRef.current?.focus(), 50); }}
                            className="p-1.5 rounded-full hover:bg-bg-3 text-gray-400 hover:text-text-main cursor-pointer"
                          >
                            <Reply size={15} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              setMenuDirection(rect.top < 260 ? "bottom" : "top");
                              setActiveMessageMenu(activeMessageMenu?.id === msg.id ? null : msg);
                            }}
                            className="p-1.5 rounded-full hover:bg-bg-3 text-gray-400 hover:text-text-main cursor-pointer"
                          >
                            <EllipsisVertical size={15} />
                          </button>

                          <AnimatePresence>
                            {activeMessageMenu?.id === msg.id && (
                              <MessageMoreMenu
                                msg={msg}
                                isMe={true}
                                isMobile={isMobile}
                                menuDirection={menuDirection}
                                formatTime={formatTime}
                                onForward={(content) => { setForwardMessageContent(content); setShowForwardModal(true); }}
                                onCopy={handleCopyMessage}
                                onLike={handleLike}
                                onClose={() => setActiveMessageMenu(null)}
                                onReply={(msg) => {
                                  setReplyTo({ id: msg.id, content: msg.content, senderId: msg.senderId });
                                  setTimeout(() => textareaRef.current?.focus(), 50);
                                }}
                                onEdit={(msg) => {
                                  setEditingMessageId(msg.id);
                                  setOriginalMessageContent(msg.content);
                                  setMessage(msg.content);
                                  setTimeout(() => {
                                    const textarea = textareaRef.current;
                                    if (textarea) {
                                      textarea.focus();
                                      const len = textarea.value.length;
                                      textarea.setSelectionRange(len, len);
                                    }
                                  }, 50);
                                }}
                                onDeleteClick={(msg) => setDeletingMessage(msg)}
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* Bubble */}
                      <div className={`relative max-w-[75%] ${msg.likedAt ? "mb-3" : ""}`}>
                        <div
                          onDoubleClick={() => !isMe && handleLike(msg.id)}
                          className={`px-4 py-2 text-[15px] whitespace-pre-wrap cursor-pointer leading-snug font-[450] ${getRadiusClass(index)} ${isMe ? "text-white" : "text-text-main"
                            } ${highlightMsgId === msg.id ? (isMe ? "pulse-bg-me" : "pulse-bg-other") : (isMe ? "bg-[#5b42f3]" : "bg-bg-2 border border-bg-3")
                            } ${isLastInBlock ? "mb-1" : ""}`}
                        >
                          {msg.editedAt && (
                            <div className={`text-[10px] select-none mb-1 font-medium ${isMe ? "text-white/60 text-right" : "text-gray-400 text-left"}`}>
                              Izmenjeno
                            </div>
                          )}
                          {/* Reply quote block */}
                          {msg.replyToContent && (
                            <div
                              onClick={(e) => { e.stopPropagation(); scrollToMessage(msg.replyToId); }}
                              className={`mb-2 px-3 py-1.5 rounded-xl cursor-pointer hover:opacity-80 transition-opacity text-[12px] border-l-2 ${isMe ? "bg-white/10 border-white/40 text-white/80" : "bg-bg-3 border-bg-4 text-gray-400"}`}
                            >
                              <p className="truncate leading-snug">
                                {msg.replyToContent.startsWith("[AUDIO:") ? "Glasovna poruka" : msg.replyToContent}
                              </p>
                            </div>
                          )}
                          {renderMessageContent(msg, isMe)}
                        </div>

                        {/* Heart icon */}
                        <AnimatePresence>
                          {msg.likedAt && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 400, damping: 20 }}
                              className={`absolute -bottom-2 ${isMe ? "left-2" : "right-2"} z-10 bg-bg-2 border border-bg-3 rounded-full p-1 shadow-sm flex items-center justify-center`}
                            >
                              <Heart size={11} className="text-red-500 fill-red-500" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* For other's messages: hover actions on RIGHT of bubble */}
                      {!isMe && (
                        <div className="relative flex items-center gap-0.5 flex-shrink-0 transition-opacity duration-150 opacity-100">
                          <button
                            onClick={() => { setReplyTo({ id: msg.id, content: msg.content, senderId: msg.senderId }); setTimeout(() => textareaRef.current?.focus(), 50); }}
                            className="p-1.5 rounded-full hover:bg-bg-3 text-gray-400 hover:text-text-main cursor-pointer"
                          >
                            <Reply size={15} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              setMenuDirection(rect.top < 260 ? "bottom" : "top");
                              setActiveMessageMenu(activeMessageMenu?.id === msg.id ? null : msg);
                            }}
                            className="p-1.5 rounded-full hover:bg-bg-3 text-gray-400 hover:text-text-main cursor-pointer"
                          >
                            <EllipsisVertical size={15} />
                          </button>

                          <AnimatePresence>
                            {activeMessageMenu?.id === msg.id && (
                              <MessageMoreMenu
                                msg={msg}
                                isMe={false}
                                isMobile={isMobile}
                                menuDirection={menuDirection}
                                formatTime={formatTime}
                                onForward={(content) => { setForwardMessageContent(content); setShowForwardModal(true); }}
                                onCopy={handleCopyMessage}
                                onLike={handleLike}
                                onClose={() => setActiveMessageMenu(null)}
                                onReply={(msg) => {
                                  setReplyTo({ id: msg.id, content: msg.content, senderId: msg.senderId });
                                  setTimeout(() => textareaRef.current?.focus(), 50);
                                }}
                                onEdit={() => { }}
                                onDeleteClick={() => { }}
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>

                    {/* Status Indicator for Last Message if it is mine */}
                    {((isLast && statusText) || String(msg.id).startsWith("temp-")) && isMe && (
                      <div className="text-[10px] text-gray-400 text-right pr-2 mt-1 font-medium transition-all duration-300">
                        {String(msg.id).startsWith("temp-") ? "Šalje se..." : statusText}
                      </div>
                    )}

                    {isLastInBlock && <div className="mb-3" />}
                  </div>
                </Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* INPUT AREA */}
      <ChatInput
        chatId={chatId}
        otherUser={otherUser}
        currentAd={currentAd}
        blockStatus={blockStatus}
        setShowUnblockModal={setShowUnblockModal}
        replyTo={replyTo}
        setReplyTo={setReplyTo}
        editingMessageId={editingMessageId}
        setEditingMessageId={setEditingMessageId}
        originalMessageContent={originalMessageContent}
        setOriginalMessageContent={setOriginalMessageContent}
        message={message}
        setMessage={setMessage}
        setChat={setChat}
        scrollToBottom={scrollToBottom}
        showScrollBottom={showScrollBottom}
        isOtherUserTyping={isOtherUserTyping}
        unreadBelowCount={unreadBelowCount}
        textareaRef={textareaRef}
        viewportHeight={viewportHeight}
        sendTypingStatus={sendTypingStatus}
      />

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .pulse-bg-me {
          animation: bgPulseMe 1s ease-in-out infinite;
        }
        @keyframes bgPulseMe {
          0%, 100% { background-color: #5b42f3; }
          50% { background-color: #003b8e; }
        }
        .pulse-bg-other {
          animation: bgPulseOther 1s ease-in-out infinite;
        }
        @keyframes bgPulseOther {
          0%, 100% { background-color: var(--bg-2); }
          50% { background-color: var(--bg-3); }
        }
        @keyframes bounceWave {
          0%, 100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(0.4);
          }
        }
        .bounce-bar {
          animation: bounceWave 1.2s ease-in-out infinite;
          transform-origin: center;
        }
      `}</style>

      {/* MODALS */}
      {otherUser && (
        <>
          <UserMoreModal
            isOpen={showOptionsModal}
            onClose={() => setShowOptionsModal(false)}
            user={otherUser}
            isBlocked={blockStatus?.isBlockedByMe || false}
            onShare={handleShare}
            onBlockConfirm={handleBlockConfirm}
            blockLoading={blockLoading}
          />
          <UnblockUserModal
            isOpen={showUnblockModal}
            onClose={() => setShowUnblockModal(false)}
            onConfirm={async () => {
              await handleBlockConfirm();
              setShowUnblockModal(false);
            }}
            username={otherUser?.username || otherUser?.fullName || ""}
            loading={blockLoading}
          />
        </>
      )}

      <ForwardModal
        isOpen={showForwardModal}
        onClose={() => setShowForwardModal(false)}
        messageContent={forwardMessageContent}
        currentUserId={Number(user?.id)}
        currentChatId={chatId}
      />

      <DeleteMessageModal
        isOpen={!!deletingMessage}
        onClose={() => setDeletingMessage(null)}
        onConfirm={confirmDeleteMessage}
        messageContent={deletingMessage?.content || ""}
      />
    </div>
  );
}
