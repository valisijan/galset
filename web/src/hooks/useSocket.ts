"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useSocket(userId?: number, currentSessionToken?: string) {
    useEffect(() => {
        if (!userId) return;

        console.log(`[useSocket] Setting up Supabase Realtime channel for user: ${userId}`);

        const channel = supabase.channel(`realtime:user:${userId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'Message' },
                (payload) => {
                    const newMsg = payload.new;
                    const rId = newMsg.receiverId ?? newMsg.receiverid ?? newMsg.receiver_id;
                    if (Number(rId) === Number(userId)) {
                        console.log("[useSocket] New message received for user:", newMsg);
                        window.dispatchEvent(new Event("unreadUpdate"));
                        window.dispatchEvent(new CustomEvent("newMessage", { detail: newMsg }));
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'Message' },
                (payload) => {
                    const updatedMsg = payload.new;
                    const rId = updatedMsg.receiverId ?? updatedMsg.receiverid ?? updatedMsg.receiver_id;
                    const sId = updatedMsg.senderId ?? updatedMsg.senderid ?? updatedMsg.sender_id;
                    if (Number(rId) === Number(userId) || Number(sId) === Number(userId)) {
                        console.log("[useSocket] Message updated for user:", updatedMsg);
                        window.dispatchEvent(new CustomEvent("messageUpdated", { detail: updatedMsg }));
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'Notification' },
                (payload) => {
                    const newNotif = payload.new;
                    const uId = newNotif.userId ?? newNotif.userid ?? newNotif.user_id;
                    if (Number(uId) === Number(userId)) {
                        console.log("[useSocket] New notification received for user:", newNotif);
                        window.dispatchEvent(new CustomEvent("newNotification", { detail: newNotif }));
                        window.dispatchEvent(new Event("notificationsUpdate"));
                    }
                }
            )
            .subscribe((status) => {
                console.log(`[useSocket] Supabase Realtime status for user ${userId}:`, status);
            });

        return () => {
            console.log(`[useSocket] Cleaning up Supabase Realtime channel for user: ${userId}`);
            supabase.removeChannel(channel);
        };
    }, [userId, currentSessionToken]);
}

