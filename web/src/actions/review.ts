"use server";

import { db } from "@/db";
import { reviews, chats, messages, users, pushTokens, notificationPreferences, notifications } from "@/db/schema";
import { eq, and, or, gte, count, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { sendPushNotification } from "@/lib/firebase-admin";

export async function addReview(targetUserId: number, rating: number, comment: string) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user || !user.id) {
      return { success: false, message: "Niste prijavljeni." };
    }

    if (rating < 1 || rating > 5) {
      return { success: false, message: "Ocena mora biti između 1 i 5." };
    }

    const userIdInt = parseInt(user.id);

    if (userIdInt === targetUserId) {
      return { success: false, message: "Ne možete oceniti sami sebe." };
    }

    const userChats = await db.select().from(chats).where(
      or(
        and(eq(chats.user1Id, userIdInt), eq(chats.user2Id, targetUserId)),
        and(eq(chats.user1Id, targetUserId), eq(chats.user2Id, userIdInt))
      )
    );

    let hasValidReviewChat = false;
    const now = Date.now();
    for (const chat of userChats) {
      const chatAgeMs = now - new Date(chat.createdAt).getTime();
      const isChatAgeValid = chatAgeMs >= 12 * 60 * 60 * 1000 && chatAgeMs <= 15 * 24 * 60 * 60 * 1000;
      if (!isChatAgeValid) continue;

      const user1Msgs = await db
        .select({ count: count() })
        .from(messages)
        .where(and(eq(messages.conversationId, chat.id), eq(messages.senderId, chat.user1Id)));

      const user2Msgs = await db
        .select({ count: count() })
        .from(messages)
        .where(and(eq(messages.conversationId, chat.id), eq(messages.senderId, chat.user2Id)));

      const hasUser1Msg = (user1Msgs[0]?.count || 0) >= 1;
      const hasUser2Msg = (user2Msgs[0]?.count || 0) >= 1;

      if (hasUser1Msg && hasUser2Msg) {
        hasValidReviewChat = true;
        break;
      }
    }

    if (!hasValidReviewChat) {
      return {
        success: false,
        message: "Da biste ocenili korisnika, morate imati aktivnu prepisku sa njim staru između 12h i 15 dana koja potvrđuje da se prodaja desila."
      };
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const existingReview = await db.query.reviews.findFirst({
      where: and(
        eq(reviews.reviewerId, userIdInt),
        eq(reviews.userId, targetUserId),
        gte(reviews.createdAt, sixMonthsAgo)
      ),
    });

    if (existingReview) {
      return { success: false, message: "Već ste ocenili ovog korisnika u poslednjih 6 meseci." };
    }

    const [insertedReview] = await db.insert(reviews).values({
      rating,
      comment,
      reviewerId: userIdInt,
      userId: targetUserId,
    }).returning();

    try {
      const [reviewer, targetUser] = await Promise.all([
        db.query.users.findFirst({
          where: eq(users.id, userIdInt),
          columns: { username: true, fullName: true, profileImg: true }
        }),
        db.query.users.findFirst({
          where: eq(users.id, targetUserId),
          columns: { username: true }
        })
      ]);

      const reviewerName = reviewer?.username || reviewer?.fullName || "Korisnik";
      const actionUrl = targetUser?.username ? `/${targetUser.username}/reviews` : `/user/${targetUserId}/reviews`;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 365);

      await db.insert(notifications).values({
        userId: targetUserId,
        type: "NEW_REVIEW",
        title: "Dobili ste novu ocenu",
        body: `Korisnik ${reviewerName} vas je ocenio`,
        senderId: userIdInt,
        reviewId: insertedReview?.id || null,
        imageUrl: reviewer?.profileImg || null,
        actionUrl,
        expiresAt,
      });

      // Check if target user has enabled review push notifications
      const prefs = await db.query.notificationPreferences.findFirst({
        where: eq(notificationPreferences.userId, targetUserId)
      });
      const wantsReviewPush = prefs ? prefs.newReviews : true;

      if (wantsReviewPush) {
        const tokens = await db.select().from(pushTokens).where(eq(pushTokens.userId, targetUserId));
        if (tokens.length > 0) {
          const invalidTokens: string[] = [];
          await Promise.all(
            tokens.map(async (doc) => {
              const ok = await sendPushNotification({
                token: doc.token,
                title: "Dobili ste novu ocenu",
                body: `Korisnik ${reviewerName} vas je ocenio`,
                data: {
                  link: actionUrl,
                }
              });
              if (!ok) {
                invalidTokens.push(doc.token);
              }
            })
          );

          if (invalidTokens.length > 0) {
            await db.delete(pushTokens).where(inArray(pushTokens.token, invalidTokens));
          }
        }
      }
    } catch (notifError) {
      console.error("Error creating review notification/push:", notifError);
    }

    revalidatePath(`/user/${targetUserId}/reviews`);

    return { success: true, message: "Ocena uspešno dodata." };
  } catch (error) {
    console.error("Error adding review:", error);
    return { success: false, message: "Greška prilikom dodavanja ocene." };
  }
}
