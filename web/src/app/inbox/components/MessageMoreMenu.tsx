"use client";

import { motion } from "framer-motion";
import { Send, Heart, Copy, Reply, Pen, Trash2 } from "lucide-react";

interface MessageMoreMenuProps {
  msg: any;
  isMe: boolean;
  isMobile: boolean;
  menuDirection: "top" | "bottom";
  formatTime: (date: string) => string;
  onForward: (content: string) => void;
  onCopy: (msg: any) => void;
  onLike: (msgId: string) => void;
  onClose: () => void;
  onReply: (msg: any) => void;
  onEdit: (msg: any) => void;
  onDeleteClick: (msg: any) => void;
}

export default function MessageMoreMenu({
  msg,
  isMe,
  isMobile,
  menuDirection,
  formatTime,
  onForward,
  onCopy,
  onLike,
  onClose,
  onReply,
  onEdit,
  onDeleteClick,
}: MessageMoreMenuProps) {

  const isAudio = msg.content?.startsWith("[AUDIO:");
  const isEditable = isMe && !isAudio && (Date.now() - new Date(msg.createdAt).getTime() < 10 * 60 * 1000);
  const isDeletable = isMe && (Date.now() - new Date(msg.createdAt).getTime() < 10 * 60 * 1000);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`absolute ${menuDirection === "top" ? "bottom-[calc(100%+4px)]" : "top-[calc(100%+4px)]"} ${
        isMe ? (isMobile ? "left-0" : "right-0") : (isMobile ? "right-0" : "left-0")
      } ${
        menuDirection === "top"
          ? isMe
            ? isMobile
              ? "origin-bottom-left"
              : "origin-bottom-right"
            : isMobile
            ? "origin-bottom-right"
            : "origin-bottom-left"
          : isMe
          ? isMobile
            ? "origin-top-left"
            : "origin-top-right"
          : isMobile
          ? "origin-top-right"
          : "origin-top-left"
      } w-36 bg-bg-2 rounded-2xl shadow-xl border border-bg-3 z-50 p-1 flex flex-col`}
    >
      <div className="px-2.5 py-1.5 text-text-main text-[11px] font-bold bg-bg-2">
        Poslato: {formatTime(msg.createdAt)}
      </div>

      <div className="h-[1px] bg-bg-3 mx-2 mb-1" />
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onReply(msg);
          onClose();
        }}
        className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl hover:bg-bg-3 text-text-main text-[13px] font-semibold transition-colors cursor-pointer text-left"
      >
        <Reply size={15} className="text-text-main" /> Odgovori
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onForward(msg.content);
          onClose();
        }}
        className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl hover:bg-bg-3 text-text-main text-[13px] font-semibold transition-colors cursor-pointer text-left"
      >
        <Send size={15} className="text-text-main" /> Prosledi
      </button>

      {!isMe && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike(msg.id);
            onClose();
          }}
          className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl hover:bg-bg-3 text-text-main text-[13px] font-semibold transition-colors cursor-pointer text-left"
        >
          <Heart size={15} className="text-text-main" /> Reaguj
        </button>
      )}

      {!isAudio && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCopy(msg);
            onClose();
          }}
          className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl hover:bg-bg-3 text-text-main text-[13px] font-semibold transition-colors cursor-pointer text-left"
        >
          <Copy size={15} className="text-text-main" /> Kopiraj
        </button>
      )}

      {isEditable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(msg);
            onClose();
          }}
          className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl hover:bg-bg-3 text-text-main text-[13px] font-semibold transition-colors cursor-pointer text-left"
        >
          <Pen size={15} className="text-text-main" /> Izmeni
        </button>
      )}

      {isDeletable && (
        <>
          <div className="h-[1px] bg-bg-3 mx-2 my-1" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick(msg);
              onClose();
            }}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl hover:bg-red-500/10 text-red-500 text-[13px] font-semibold transition-colors cursor-pointer text-left"
          >
            <Trash2 size={15} className="text-red-500" /> Obriši
          </button>
        </>
      )}

    </motion.div>
  );
}
