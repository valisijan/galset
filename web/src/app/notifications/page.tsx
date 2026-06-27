import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, desc, and, ne } from "drizzle-orm";
import { auth } from "@/auth";
import NotificationsClient from "@/components/notifications/NotificationsClient";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Obaveštenja - Galset",
};

export const dynamic = "force-dynamic";

function NotificationsSkeleton() {
    return (
        <div className="flex flex-col gap-4 animate-pulse">
            <h1 className="text-text-main text-xl sm:text-2xl font-bold mt-4 mb-2 text-center">Obaveštenja</h1>
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-bg-2 rounded-3xl border border-bg-3">
                    <div className="flex items-center gap-4 w-full">
                        <div className="w-12 h-12 bg-bg-3 rounded-full shrink-0" />
                        <div className="space-y-2 flex-1">
                            <div className="h-5 bg-bg-3 rounded w-1/3" />
                            <div className="h-4 bg-bg-3 rounded w-2/3" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

async function NotificationsList({ userId }: { userId: number }) {
    const notifyData = await db.query.notifications.findMany({
        where: and(eq(notifications.userId, userId), ne(notifications.type, "MESSAGE_REACTION")),
        orderBy: [desc(notifications.createdAt)],
        limit: 20
    });

    const serializedNotifications = notifyData.map(n => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
        expiresAt: n.expiresAt.toISOString()
    }));

    return <NotificationsClient initialNotifications={serializedNotifications} />;
}

export default async function NotificationsPage() {
    const session = await auth();
    const currentUser = session?.user;

    if (!currentUser || !currentUser.id) {
        redirect("/auth");
    }

    const userId = parseInt(currentUser.id);

    return (
        <div className="min-h-screen bg-bg-1 flex justify-center">
            <div className="w-full max-w-[800px] px-4 pt-2 pb-6">
                <Suspense fallback={<NotificationsSkeleton />}>
                    <NotificationsList userId={userId} />
                </Suspense>
            </div>
        </div>
    );
}
