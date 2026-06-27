import ChatWindow from "../components/ChatWindow"
import { notFound } from "next/navigation"
import { db } from "@/db"
import { chats as conversations } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/auth"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Razgovor - Galset",
};

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  
  const session = await auth();
  if (!session?.user?.id) {
     return notFound();
  }
  
  try {
      const userId = parseInt(session.user.id);
      const conversation = await db.query.chats.findFirst({
          where: eq(conversations.id, id)
      });
      if (!conversation) {
          return notFound();
      }
      
      if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
          return notFound();
      }
  } catch(e) {
      return notFound();
  }

  return <ChatWindow chatId={id} />
}
