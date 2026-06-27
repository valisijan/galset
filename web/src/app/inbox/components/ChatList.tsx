"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
const UserAvatar = "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/assets/user-avatar.png?updatedAt=1776365714850";
import Link from "next/link"
import { useParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Search } from "lucide-react"

type Chat = {
  id: string
  name: string
  avatar: string
  adName: string
  lastMessage: string
  time: string
  adId?: number
  otherUserId: number
  lastMessageSenderId?: number
  unread: boolean
  unreadCount?: number
}

export default function ChatList() {
  const { user, sessionToken } = useAuth()
  const params = useParams()
  const currentChatId = params?.id as string
  const [search, setSearch] = useState("")
  const [conversations, setConversations] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)

  const fetchConversations = async () => {
    try {
      const headers: Record<string, string> = {};
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`;
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/conversations`, { headers })
      const data = await res.json()
      if (data.success) {
        const mapped: Chat[] = data.conversations.map((conv: any) => ({
          id: conv.id,
          otherUserId: conv.otherUser.id,
          name: conv.otherUser.username || conv.otherUser.fullName || conv.otherUser.name,
          avatar: conv.otherUser.profileImg?.split("|||")[0] || UserAvatar,
          adName: conv.ad?.title || "Opšti razgovor",
          lastMessage: conv.lastMessage,
          lastMessageSenderId: conv.lastMessageSenderId,
          time: new Date(conv.time).toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" }),
          adId: conv.ad?.id,
          unread: conv.unread,
          unreadCount: conv.unreadCount
        }))
        setConversations(mapped)
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchConversations()

    window.addEventListener("unreadUpdate", fetchConversations);
    return () => window.removeEventListener("unreadUpdate", fetchConversations);
  }, [user])

  const filtered = conversations.filter((chat) =>
    chat.name.toLowerCase().includes(search.toLowerCase()) ||
    chat.adName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full overflow-y-auto md:overflow-hidden custom-chat-scrollbar pl-4 pr-5 pt-5 pb-4 md:p-4">
      <h2 className="text-text-main text-xl sm:text-2xl font-bold mb-5 md:mb-4 text-center">
        Razgovori
      </h2>

      {/* Search */}
      <div className="relative mb-4">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-text-main opacity-70"
        />
        <input
          type="text"
          placeholder="Pretraži razgovore..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-bg-2 border border-bg-3 rounded-full pl-10 pr-4 py-2 text-text-main placeholder-gray-400 focus:outline-none focus:border-[#6366f1] transition-all w-full"
        />
      </div>

      {/* Lista razgovora */}
      <div className="flex flex-col gap-2 md:overflow-y-auto custom-chat-scrollbar pr-1 md:flex-1 md:min-h-0">
        {loading ? (
          <div className="p-2 space-y-1">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-3xl animate-pulse">
                <div className="w-12 h-12 rounded-full bg-bg-2 shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-bg-2 rounded w-1/2" />
                  <div className="h-3 bg-bg-2 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((chat) => (
            <Link
              href={`/inbox/${chat.id}`}
              key={chat.id}
              className={`p-3 rounded-3xl cursor-pointer transition flex items-center gap-3 ${currentChatId === chat.id ? 'bg-bg-2' : 'hover:bg-bg-2 focus:bg-bg-2'}`}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-bg-2 flex-shrink-0 relative">
                <Image
                  src={chat.avatar}
                  alt={chat.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <p className={`text-text-main font-bold truncate ${chat.unread ? "font-extrabold" : ""}`}>{chat.adName}</p>
                  <span className={`text-[11px] ${chat.unread ? "text-text-main" : "text-gray-400"}`}>{chat.time}</span>
                </div>
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-gray-400 text-xs truncate pr-4">
                    {chat.name}
                  </p>
                  {chat.unread && (
                    <div className="min-w-[18px] h-[18px] px-1.5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm flex-shrink-0 tabular-nums select-none animate-in zoom-in-50 duration-200">
                      {chat.unreadCount || 1}
                    </div>
                  )}
                </div>
                <p className={`text-sm truncate ${chat.unread ? "text-text-main font-medium" : "text-gray-400"}`}>
                  {Number(chat.lastMessageSenderId) === Number(user?.id) ? (
                    <span className="opacity-70">
                      Ja: {chat.lastMessage?.startsWith("[AUDIO:") ? "Glasovna poruka" : chat.lastMessage}
                    </span>
                  ) : (
                    chat.lastMessage?.startsWith("[AUDIO:") ? "Glasovna poruka" : chat.lastMessage
                  )}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center mt-4">Nema pronađenih razgovora</p>
        )}
      </div>
    </div>
  )
}
