"use client";

import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Send, X, ArrowDown, Check, AudioLines } from "lucide-react";
import { toast } from "sonner";
import TypingIndicator from "@/components/TypingIndicator";

interface ChatInputProps {
  chatId: string;
  otherUser: any;
  currentAd: any;
  blockStatus: { isBlockedByMe: boolean; amIBlocked: boolean } | null;
  setShowUnblockModal: (val: boolean) => void;
  replyTo: { id: string; content: string; senderId: number } | null;
  setReplyTo: (val: { id: string; content: string; senderId: number } | null) => void;
  editingMessageId: string | null;
  setEditingMessageId: (val: string | null) => void;
  originalMessageContent: string | null;
  setOriginalMessageContent: (val: string | null) => void;
  message: string;
  setMessage: (val: string) => void;
  setChat: React.Dispatch<React.SetStateAction<any[]>>;
  scrollToBottom: (smooth?: boolean) => void;
  showScrollBottom: boolean;
  isOtherUserTyping: boolean;
  unreadBelowCount: number;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  viewportHeight: string;
  sendTypingStatus: (typing: boolean) => void;
}

export default function ChatInput({
  chatId,
  otherUser,
  currentAd,
  blockStatus,
  setShowUnblockModal,
  replyTo,
  setReplyTo,
  editingMessageId,
  setEditingMessageId,
  originalMessageContent,
  setOriginalMessageContent,
  message,
  setMessage,
  setChat,
  scrollToBottom,
  showScrollBottom,
  isOtherUserTyping,
  unreadBelowCount,
  textareaRef,
  viewportHeight,
  sendTypingStatus
}: ChatInputProps) {
  const { user, sessionToken } = useAuth();

  // Audio recording state & refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimeRef = useRef<number>(0);
  const isCancelledRef = useRef<boolean>(false);
  const recordedBlobRef = useRef<Blob | null>(null);
  const shouldSendImmediatelyRef = useRef<boolean>(false);

  const [isRecording, setIsRecording] = useState(false);
  const [isCurrentlyRecording, setIsCurrentlyRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isMultiline, setIsMultiline] = useState(false);

  const myTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const inputAreaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      if (myTypingTimeoutRef.current) clearTimeout(myTypingTimeoutRef.current);
    };
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    if (blockStatus?.isBlockedByMe || blockStatus?.amIBlocked || otherUser?.isDeactivated || otherUser?.username === 'obrisan_korisnik') return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingStreamRef.current = stream;

      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/mp4';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());

        if (isCancelledRef.current) {
          recordedBlobRef.current = null;
          return;
        }

        const audioBlob = new Blob(chunks, { type: 'audio/mpeg' });
        recordedBlobRef.current = audioBlob;

        if (shouldSendImmediatelyRef.current) {
          shouldSendImmediatelyRef.current = false;
          const finalDuration = recordingTimeRef.current;
          await uploadAndSendAudio(audioBlob, finalDuration);
          setIsRecording(false);
        }
      };

      setRecordingTime(0);
      recordingTimeRef.current = 0;
      isCancelledRef.current = false;
      recordedBlobRef.current = null;
      shouldSendImmediatelyRef.current = false;

      mediaRecorder.start();
      setIsRecording(true);
      setIsCurrentlyRecording(true);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const next = prev + 1;
          recordingTimeRef.current = next;
          if (next >= 60) {
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
            setIsCurrentlyRecording(false);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
              mediaRecorderRef.current.stop();
            }
          }
          return next;
        });
      }, 1000);

    } catch (err) {
      console.error("Failed to start recording:", err);
      toast.error("Nije moguće pristupiti mikronu.");
    }
  };

  const cancelRecording = () => {
    isCancelledRef.current = true;
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsCurrentlyRecording(false);
    setRecordingTime(0);
    recordedBlobRef.current = null;
  };

  const handleSendClick = async () => {
    if (isCurrentlyRecording) {
      shouldSendImmediatelyRef.current = true;
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      setIsCurrentlyRecording(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } else {
      if (recordedBlobRef.current) {
        await uploadAndSendAudio(recordedBlobRef.current, recordingTimeRef.current);
      }
      setIsRecording(false);
    }
  };

  const uploadAndSendAudio = async (blob: Blob, durationSeconds: number) => {
    if (otherUser?.isDeactivated || otherUser?.username === 'obrisan_korisnik') return;
    const tempId = `temp-${Date.now()}`;
    const capturedReplyTo = replyTo;
    const replyToContentText = capturedReplyTo?.content?.startsWith("[AUDIO:") ? "Glasovna poruka" : (capturedReplyTo?.content || null);

    const optimisticMsg = {
      id: tempId,
      senderId: user ? Number(user.id) : 0,
      receiverId: Number(otherUser.id),
      adId: currentAd?.id || null,
      conversationId: chatId,
      content: `[AUDIO:loading|${durationSeconds}]`,
      createdAt: new Date().toISOString(),
      sender: user || undefined,
      readAt: null,
      likedAt: null,
      replyToId: capturedReplyTo?.id || null,
      replyToContent: replyToContentText,
    };

    setChat((prev) => [...prev, optimisticMsg]);
    setReplyTo(null);
    setTimeout(scrollToBottom, 50);

    try {
      const formData = new FormData();
      formData.append('file', blob, 'audio.mp3');

      const headers: Record<string, string> = {};
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`;
      }

      const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/audio`, {
        method: 'POST',
        headers,
        body: formData
      });

      const uploadData = await uploadRes.json();
      if (!uploadData.success || !uploadData.url) {
        throw new Error("Upload failed");
      }

      const audioUrl = uploadData.url;
      const finalContent = `[AUDIO:${audioUrl}|${durationSeconds}]`;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionToken ? { "Authorization": `Bearer ${sessionToken}` } : {})
        },
        body: JSON.stringify({
          senderId: user ? Number(user.id) : 0,
          receiverId: Number(otherUser.id),
          adId: currentAd?.id || null,
          conversationId: chatId,
          content: finalContent,
          replyToId: capturedReplyTo?.id || null,
          replyToContent: replyToContentText,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setChat((prev) => prev.map((m) => (m.id === tempId ? { ...data.message, sender: user } : m)));
        window.dispatchEvent(new Event("unreadUpdate"));
      } else {
        setChat((prev) => prev.filter((m) => m.id !== tempId));
        toast.error("Greška pri slanju poruke.");
      }
    } catch (err) {
      console.error("Failed to upload/send audio message:", err);
      setChat((prev) => prev.filter((m) => m.id !== tempId));
      toast.error("Slanje glasovne poruke nije uspelo.");
    }
  };

  const handleMessageChange = (val: string) => {
    if (blockStatus?.isBlockedByMe || blockStatus?.amIBlocked || otherUser?.isDeactivated || otherUser?.username === 'obrisan_korisnik') return;
    setMessage(val);

    if (!val.trim()) {
      if (isTypingRef.current) {
        sendTypingStatus(false);
        isTypingRef.current = false;
      }
      if (myTypingTimeoutRef.current) clearTimeout(myTypingTimeoutRef.current);
      return;
    }

    if (!isTypingRef.current) {
      sendTypingStatus(true);
      isTypingRef.current = true;
    }

    if (myTypingTimeoutRef.current) clearTimeout(myTypingTimeoutRef.current);
    myTypingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
      isTypingRef.current = false;
    }, 3000);
  };

  const sendMessage = async () => {
    if (!message.trim() || !user || !otherUser || otherUser?.isDeactivated || otherUser?.username === 'obrisan_korisnik') {
      if (message.trim()) {
        console.warn("sendMessage BLOCKED: ", { hasUser: !!user, hasOtherUser: !!otherUser, isDeactivated: !!otherUser?.isDeactivated });
      }
      return;
    }

    const content = message.trim();
    const tempId = `temp-${Date.now()}`;
    const capturedReplyTo = replyTo;
    const replyToContentText = capturedReplyTo?.content?.startsWith("[AUDIO:") ? "Glasovna poruka" : (capturedReplyTo?.content || null);

    const optimisticMsg = {
      id: tempId,
      senderId: Number(user.id),
      receiverId: Number(otherUser.id),
      adId: currentAd?.id || null,
      conversationId: chatId,
      content,
      createdAt: new Date().toISOString(),
      sender: user,
      readAt: null,
      likedAt: null,
      replyToId: capturedReplyTo?.id || null,
      replyToContent: replyToContentText,
    };

    setChat((prev) => [...prev, optimisticMsg]);
    setMessage("");
    setIsMultiline(false);
    setReplyTo(null);
    if (isTypingRef.current) {
      sendTypingStatus(false);
      isTypingRef.current = false;
    }
    if (myTypingTimeoutRef.current) clearTimeout(myTypingTimeoutRef.current);

    if (textareaRef.current) {
      textareaRef.current.style.height = "24px";
      textareaRef.current.focus();
    }

    setTimeout(scrollToBottom, 50);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`;
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/send`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          senderId: Number(user.id),
          receiverId: Number(otherUser.id),
          adId: currentAd?.id || null,
          conversationId: chatId,
          content,
          replyToId: capturedReplyTo?.id || null,
          replyToContent: replyToContentText,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setChat((prev) => prev.map((m) => (m.id === tempId ? { ...data.message, sender: user } : m)));
        window.dispatchEvent(new Event("unreadUpdate"));
      } else {
        setChat((prev) => prev.filter((m) => m.id !== tempId));
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setChat((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  const cancelEditMessage = () => {
    setEditingMessageId(null);
    setOriginalMessageContent(null);
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "24px";
    }
  };

  const saveEditMessage = async () => {
    if (!editingMessageId || !message.trim()) return;
    const editedContent = message.trim();
    const msgId = editingMessageId;
    const prevContent = originalMessageContent || "";

    let prevEditedAt: string | null = null;
    setChat(prev => {
      const found = prev.find(m => m.id === msgId);
      if (found) {
        prevEditedAt = found.editedAt;
      }
      return prev.map(m => m.id === msgId ? { ...m, content: editedContent, editedAt: new Date().toISOString() } : m);
    });

    setEditingMessageId(null);
    setOriginalMessageContent(null);
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "24px";
    }

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`;
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/edit`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          messageId: msgId,
          content: editedContent
        })
      });
      const data = await res.json();
      if (data.success) {
        if (data.editedAt) {
          setChat(prev => prev.map(m => m.id === msgId ? { ...m, editedAt: data.editedAt } : m));
        }
      } else {
        toast.error("Greška pri izmeni poruke");
        setChat(prev => prev.map(m => m.id === msgId ? { ...m, content: prevContent, editedAt: prevEditedAt } : m));
      }
    } catch (err) {
      console.error("Edit message request failed:", err);
      toast.error("Greška pri izmeni poruke");
      setChat(prev => prev.map(m => m.id === msgId ? { ...m, content: prevContent, editedAt: prevEditedAt } : m));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (e.key === "Enter" && !e.shiftKey && !isMobileDevice) {
      e.preventDefault();
      if (editingMessageId) {
        saveEditMessage();
      } else {
        sendMessage();
      }
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 168) + "px";
    setIsMultiline(el.scrollHeight > 28);
  };

  useLayoutEffect(() => { handleInput(); }, [message]);

  useEffect(() => {
    const el = inputAreaRef.current;
    if (!el) return;

    const preventDefault = (e: TouchEvent) => {
      if (e.touches.length > 1) return;
      if (e.target === textareaRef.current || textareaRef.current?.contains(e.target as Node)) return;
      e.preventDefault();
    };

    el.addEventListener("touchmove", preventDefault, { passive: false });
    return () => el.removeEventListener("touchmove", preventDefault);
  }, [textareaRef]);

  useEffect(() => {
    if (document.activeElement === textareaRef.current) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [viewportHeight, scrollToBottom, textareaRef]);

  return (
    <div ref={inputAreaRef} className="absolute bottom-0 left-0 right-0 z-30 touch-none bg-gradient-to-t from-bg-1 via-bg-1/90 to-transparent pt-14 pb-3 px-3 pointer-events-none">
      <div className="relative w-full pointer-events-auto">
        <AnimatePresence>
          {showScrollBottom && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToBottom(true)}
              className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-40 w-10 h-10 bg-bg-2 border border-bg-3 hover:border-bg-4 text-text-main rounded-full flex items-center justify-center shadow-lg cursor-pointer"
              type="button"
            >
              <ArrowDown size={18} />
              {unreadBelowCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md"
                >
                  {unreadBelowCount}
                </motion.span>
              )}
            </motion.button>
          )}
        </AnimatePresence>

        <div className="w-full">
          {/* Typing Indicator - always above input */}
          <AnimatePresence>
            {isOtherUserTyping && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-2"
              >
                <div className="flex items-center gap-1.5 justify-start">
                  <div className="px-4 py-2.5 rounded-full bg-bg-2 border border-bg-3 text-text-main flex items-center inline-flex">
                    <TypingIndicator />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Block/Deactivation/Deletion Status Banner */}
          {otherUser?.username === 'obrisan_korisnik' ? (
            <div className="flex items-center justify-center gap-2 mb-2 px-4 py-2 bg-bg-2 rounded-2xl border border-bg-3">
              <span className="text-gray-400 text-xs text-center font-[450]">
                Korisnik je obrisao svoj nalog.
              </span>
            </div>
          ) : otherUser?.isDeactivated ? (
            <div className="flex items-center justify-center gap-2 mb-2 px-4 py-2 bg-bg-2 rounded-2xl border border-bg-3">
              <span className="text-gray-400 text-xs text-center font-[450]">
                Korisnik <span className="font-bold text-text-main">{otherUser?.username || otherUser?.fullName}</span> je deaktivirao nalog.
              </span>
            </div>
          ) : (
            <>
              {blockStatus?.isBlockedByMe && (
                <div className="flex items-center justify-center gap-1.5 mb-2 px-4 py-2 bg-bg-2 rounded-2xl border border-bg-3">
                  <span className="text-gray-400 text-xs text-center">
                    Blokirali ste korisnika <span className="font-semibold text-text-main">{otherUser?.username || otherUser?.fullName}</span>. Više ne možete razmenjivati poruke.{" "}
                    <button
                      type="button"
                      onClick={() => setShowUnblockModal(true)}
                      className="text-[#6366f1] hover:underline cursor-pointer font-semibold ml-1"
                    >
                      Odblokiraj
                    </button>
                  </span>
                </div>
              )}
              {!blockStatus?.isBlockedByMe && blockStatus?.amIBlocked && (
                <div className="flex items-center justify-center gap-2 mb-2 px-4 py-2 bg-bg-2 rounded-2xl border border-bg-3">
                  <span className="text-gray-400 text-xs text-center">
                    Korisnik <span className="font-semibold text-text-main">{otherUser?.username || otherUser?.fullName}</span> vas je blokirao. Više ne možete razmenjivati poruke.
                  </span>
                </div>
              )}
            </>
          )}

          {/* Reply Preview Bar */}
          <AnimatePresence>
            {replyTo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mb-2 px-4 py-2 bg-bg-2 border border-bg-3 rounded-3xl flex items-center justify-between gap-3 shadow-sm">
                  <div className="flex-1 min-w-0">
                    <p className="text-[#6366f1] text-[10px] font-bold mb-0.5">Odgovori na poruku</p>
                    <p className="text-white text-xs truncate font-medium">
                      {replyTo.content?.startsWith("[AUDIO:") ? "Glasovna poruka" : replyTo.content}
                    </p>
                  </div>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="flex-shrink-0 p-1 rounded-full hover:bg-bg-3 text-text-main/70 hover:text-text-main transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={`flex items-end gap-2.5 border ${blockStatus?.isBlockedByMe || blockStatus?.amIBlocked || otherUser?.isDeactivated || otherUser?.username === 'obrisan_korisnik' ? 'border-bg-3 bg-bg-2 opacity-60' : 'border-bg-3 bg-bg-2'} p-1.5 md:p-2 ${isRecording || !isMultiline ? "rounded-full" : "rounded-3xl"} w-full`}>
            {isRecording ? (
              <div className="flex items-center justify-between w-full h-[32px] px-0 select-none">
                {/* Left: Cancel Button (X icon only) */}
                <div className="flex items-center shrink-0">
                  <button
                    type="button"
                    onClick={cancelRecording}
                    className="p-1.5 rounded-full hover:bg-bg-3 text-text-main/70 hover:text-red-500 transition-colors cursor-pointer"
                    title="Otkaži"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Center: Duration / Time */}
                <div className="flex-1 flex items-center justify-center gap-2 select-none">
                  {isCurrentlyRecording && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                  )}
                  <span className="text-text-main font-semibold text-[15px] tabular-nums">
                    {formatTimer(recordingTime)}
                  </span>
                </div>

                {/* Right: Send / Stop button */}
                <div className="flex items-center shrink-0">
                  <button
                    type="button"
                    onClick={handleSendClick}
                    className="w-8 h-8 rounded-full bg-[#5b42f3] hover:bg-[#4b35d6] flex items-center justify-center cursor-pointer text-white transition-colors"
                    title="Pošalji"
                  >
                    <Send size={15} className="text-white ml-[-1px] mt-[1px]" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => handleMessageChange(e.target.value)}
                  onInput={handleInput}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    setTimeout(() => scrollToBottom(false), 50);
                    setTimeout(() => scrollToBottom(false), 150);
                  }}
                  placeholder={blockStatus?.isBlockedByMe || blockStatus?.amIBlocked || otherUser?.isDeactivated || otherUser?.username === 'obrisan_korisnik' ? "Ne možete slati poruke" : "Poruka..."}
                  rows={1}
                  disabled={!!(blockStatus?.isBlockedByMe || blockStatus?.amIBlocked || otherUser?.isDeactivated || otherUser?.username === 'obrisan_korisnik')}
                  className="flex-1 bg-transparent ml-2 border-none outline-none text-text-main text-[15px] resize-none py-1 placeholder-gray-500 disabled:cursor-not-allowed custom-modal-scrollbar touch-auto"
                  style={{ minHeight: 24, maxHeight: 168 }}
                />

                <AnimatePresence>
                  {(message.trim() || editingMessageId) && !blockStatus?.isBlockedByMe && !blockStatus?.amIBlocked && !otherUser?.isDeactivated && otherUser?.username !== 'obrisan_korisnik' && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {editingMessageId ? (
                        <>
                          <motion.button
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            onClick={cancelEditMessage}
                            className="w-8 h-8 rounded-full bg-bg-3 hover:bg-bg-4 flex items-center justify-center cursor-pointer transition-colors text-text-main/70 hover:text-text-main"
                            title="Otkaži izmenu"
                            type="button"
                          >
                            <X size={15} />
                          </motion.button>

                          <motion.button
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: (!message.trim() || message.trim() === originalMessageContent?.trim()) ? 0.5 : 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            onClick={saveEditMessage}
                            disabled={!message.trim() || message.trim() === originalMessageContent?.trim()}
                            className="w-8 h-8 rounded-full bg-[#5b42f3] hover:bg-[#4b35d6] flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Sačuvaj izmene"
                            type="button"
                          >
                            <Check size={15} className="text-white" />
                          </motion.button>
                        </>
                      ) : (
                        <motion.button
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          onClick={sendMessage}
                          className="w-8 h-8 rounded-full bg-[#5b42f3] flex items-center justify-center cursor-pointer hover:bg-[#4b35d6] transition-colors"
                          title="Pošalji"
                          type="button"
                        >
                          <Send size={15} className="text-white ml-[-1px] mt-[1px]" />
                        </motion.button>
                      )}
                    </div>
                  )}

                  {!message.trim() && !editingMessageId && !blockStatus?.isBlockedByMe && !blockStatus?.amIBlocked && !otherUser?.isDeactivated && otherUser?.username !== 'obrisan_korisnik' && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      onClick={startRecording}
                      className="w-8 h-8 rounded-full bg-[#5b42f3] hover:bg-[#4b35d6] flex items-center justify-center cursor-pointer transition-colors shrink-0 text-white"
                      title="Snimi glasovnu poruku"
                      type="button"
                    >
                      <AudioLines size={15} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
