import {
  boolean,
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  serial,
  doublePrecision,
  json,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import crypto from 'crypto'

export const adStatusEnum = pgEnum("AdStatus", ["ACTIVE", "EXPIRED", "DELETED", "DEACTIVATED", "DRAFT"]);
export const transactionTypeEnum = pgEnum("TransactionType", ["DEPOSIT", "SPEND", "REFUND", "PLAN_PURCHASE"]);
export const planTypeEnum = pgEnum("PlanType", ["FREE", "PLUS", "PRO", "ULTRA"]);
export const promotionTypeEnum = pgEnum("PromotionType", ["FEATURED", "PRIORITY", "TOP", "SEARCH", "COMBO"]);
export const reportTargetTypeEnum = pgEnum("ReportTargetType", ["USER", "AD", "MESSAGE", "REVIEW"]);

export const users = pgTable("User", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password"),
  username: text("username").unique(),
  fullName: text("fullName"),
  description: text("description"),
  country: text("country"),
  city: text("city"),
  address: text("address"),
  phone: text("phone"),
  birthDate: timestamp("birthDate", { mode: "date" }),
  profileImg: text("profileImg"),
  image: text("image"),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  isDeactivated: boolean("isDeactivated").notNull().default(false),

  supabaseId: text("supabaseId").unique(),
}, (table) => [
  index("User_createdAt_idx").on(table.createdAt)
]);



export const ads = pgTable("Ad", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price"),
  currency: text("currency"),
  isPriceOnRequest: boolean("isPriceOnRequest").notNull().default(false),
  isReserved: boolean("isReserved").notNull().default(false),
  showAddress: boolean("showAddress").notNull().default(true),
  showPhone: boolean("showPhone").notNull().default(true),
  category: text("category").notNull(),
  country: text("country").notNull(),
  city: text("city").notNull(),
  address: text("address"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  phone: text("phone"),
  images: text("images").array().notNull(),
  attributes: jsonb("attributes"),
  status: adStatusEnum("status").notNull().default("ACTIVE"),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
  deletedAt: timestamp("deletedAt", { mode: "date" }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
}, (table) => [
  index("Ad_status_expiresAt_idx").on(table.status, table.expiresAt),
  index("Ad_createdAt_idx").on(table.createdAt),
  index("Ad_userId_idx").on(table.userId),
  index("Ad_category_idx").on(table.category),
  index("Ad_city_idx").on(table.city)
]);

export const drafts = pgTable("Draft", {
  id: serial("id").primaryKey(),
  title: text("title"),
  description: text("description"),
  price: doublePrecision("price"),
  currency: text("currency"),
  isPriceOnRequest: boolean("isPriceOnRequest").notNull().default(false),
  showAddress: boolean("showAddress").notNull().default(true),
  showPhone: boolean("showPhone").notNull().default(true),
  category: text("category"),
  country: text("country").notNull().default("Srbija"),
  city: text("city"),
  address: text("address"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  phone: text("phone"),
  images: text("images").array().notNull().default([]),
  attributes: jsonb("attributes").default({}),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
}, (table) => [
  index("Draft_userId_idx").on(table.userId),
]);

export const tempImages = pgTable("TempImage", {
  id: serial("id").primaryKey(),
  fileId: text("fileId").notNull(),
  url: text("url").notNull(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  isPublished: boolean("isPublished").notNull().default(false),
  imageType: text("imageType"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const adPromotions = pgTable("AdPromotion", {
  id: serial("id").primaryKey(),
  adId: integer("adId").notNull().references(() => ads.id, { onDelete: "cascade" }),
  type: promotionTypeEnum("type").notNull(),
  expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const chats = pgTable("Chat", {
  id: text("id").primaryKey(),
  user1Id: integer("user1Id").notNull().references(() => users.id, { onDelete: "cascade" }),
  user2Id: integer("user2Id").notNull().references(() => users.id, { onDelete: "cascade" }),
  adId: integer("adId").references(() => ads.id, { onDelete: "cascade" }),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("Chat_user1Id_user2Id_adId_key").on(t.user1Id, t.user2Id, t.adId)
]);

export const messages = pgTable("Message", {
  id: serial("id").primaryKey(),
  senderId: integer("senderId").notNull().references(() => users.id, { onDelete: "cascade" }),
  receiverId: integer("receiverId").notNull().references(() => users.id, { onDelete: "cascade" }),
  adId: integer("adId").references(() => ads.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  conversationId: text("conversationId").notNull().references(() => chats.id, { onDelete: "cascade" }),
  readAt: timestamp("readAt", { mode: "date" }),
  likedAt: timestamp("likedAt", { mode: "date" }),
  replyToId: integer("replyToId"),
  replyToContent: text("replyToContent"),
  editedAt: timestamp("editedAt", { mode: "date" }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const wishlists = pgTable("Wishlist", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  adId: integer("adId").notNull().references(() => ads.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("Wishlist_userId_adId_key").on(t.userId, t.adId)
]);

export const reviews = pgTable("Review", {
  id: serial("id").primaryKey(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  reviewerId: integer("reviewerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  adId: integer("adId").references(() => ads.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("Review_reviewerId_userId_adId_key").on(t.reviewerId, t.userId, t.adId)
]);

export const userFollows = pgTable("UserFollow", {
  id: serial("id").primaryKey(),
  followerId: integer("followerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  followingId: integer("followingId").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("UserFollow_followerId_followingId_key").on(t.followerId, t.followingId)
]);

export const notifications = pgTable("Notification", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  isRead: boolean("isRead").notNull().default(false),
  readAt: timestamp("readAt", { mode: "date" }),
  imageUrl: text("imageUrl"),
  actionUrl: text("actionUrl"),
  senderId: integer("senderId"),
  adId: integer("adId"),
  reviewId: integer("reviewId"),
  messageId: integer("messageId"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
});

export const blockedUsers = pgTable("BlockedUser", {
  id: serial("id").primaryKey(),
  blockerId: integer("blockerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  blockedId: integer("blockedId").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("BlockedUser_blockerId_blockedId_key").on(t.blockerId, t.blockedId)
]);

export const wallets = pgTable("Wallet", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  balance: integer("balance").notNull().default(0),
  plan: planTypeEnum("plan"),
  planExpiresAt: timestamp("planExpiresAt", { mode: "date" }),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const transactions = pgTable("Transaction", {
  id: serial("id").primaryKey(),
  walletId: integer("walletId").notNull().references(() => wallets.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  type: transactionTypeEnum("type").notNull(),
  referenceType: text("referenceType"),
  referenceId: integer("referenceId"),
  description: text("description"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const reports = pgTable("Report", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  targetType: reportTargetTypeEnum("targetType").notNull(),
  targetId: integer("targetId").notNull(),
  reason: text("reason").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const adViews = pgTable("AdView", {
  id: serial("id").primaryKey(),
  adId: integer("adId").notNull().references(() => ads.id, { onDelete: "cascade" }),
  userId: integer("userId").references(() => users.id, { onDelete: "cascade" }),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("AdView_userId_adId_key").on(t.userId, t.adId)
]);


export const aiChats = pgTable("AiChat", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: integer("userId").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("Novi razgovor"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

export const aiMessages = pgTable("AiMessage", {
  id: serial("id").primaryKey(),
  sessionId: text("sessionId").notNull().references(() => aiChats.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content"),
  toolCalls: json("toolCalls"),
  thumbUp: boolean("thumbUp").default(false),
  thumbDown: boolean("thumbDown").default(false),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const reportIssues = pgTable("ReportIssue", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id, { onDelete: "cascade" }),
  targetType: text("targetType").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const pricing = pgTable("Pricing", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // 'krediti', 'promocija', 'plan'
  name: text("name").notNull(),
  price: doublePrecision("price").notNull(),
  currency: text("currency").notNull(), // 'EUR', 'KREDITI'
  features: jsonb("features"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

export const categories = pgTable("Category", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  icon: text("icon"),
  parentId: integer("parentId"),
});

export const filters = pgTable("Filter", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  type: text("type").notNull(),
  options: jsonb("options"),
  source: text("source"),
  isFormRadio: boolean("isFormRadio").default(false),
});

export const filterUses = pgTable("FilterUse", {
  categoryId: integer("categoryId").notNull().references(() => categories.id, { onDelete: "cascade" }),
  filterId: integer("filterId").notNull().references(() => filters.id, { onDelete: "cascade" }),
}, (t) => [
  primaryKey({ columns: [t.categoryId, t.filterId] })
]);

export const brands = pgTable("Brand", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // e.g. 'cars', 'motorcycles'
  brand: text("brand").notNull(),
  models: jsonb("models").notNull(), // Array of models
});

export const countries = pgTable("Country", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

export const cities = pgTable("City", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  countryId: integer("countryId").notNull().references(() => countries.id, { onDelete: "cascade" }),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
});

// Relations definitions
export const usersRelations = relations(users, ({ many, one }) => ({
  ads: many(ads),
  drafts: many(drafts),
  wishlist: many(wishlists),
  reviewsGiven: many(reviews, { relationName: "ReviewsGiven" }),
  reviewsReceived: many(reviews, { relationName: "ReviewsReceived" }),
  chats1: many(chats, { relationName: "User1Chats" }),
  chats2: many(chats, { relationName: "User2Chats" }),
  following: many(userFollows, { relationName: "UserFollowing" }),
  followers: many(userFollows, { relationName: "UserFollowers" }),
  notifications: many(notifications),
  aiChats: many(aiChats),
  history: many(adViews),
  wallet: one(wallets, { fields: [users.id], references: [wallets.userId] }),
  blockedUsers: many(blockedUsers, { relationName: "UserBlocked" }),
  blockedBy: many(blockedUsers, { relationName: "UserBlockedBy" }),
  reportIssues: many(reportIssues),
  sentMessages: many(messages, { relationName: "SentMessages" }),
  receivedMessages: many(messages, { relationName: "ReceivedMessages" }),
  pushTokens: many(pushTokens),
  sales: many(sales),
  notificationPreferences: one(notificationPreferences, { fields: [users.id], references: [notificationPreferences.userId] }),
}));

export const draftsRelations = relations(drafts, ({ one }) => ({
  user: one(users, { fields: [drafts.userId], references: [users.id] }),
}));

export const adsRelations = relations(ads, ({ one, many }) => ({
  user: one(users, { fields: [ads.userId], references: [users.id] }),
  wishlist: many(wishlists),
  reviews: many(reviews),
  chats: many(chats),
  promotions: many(adPromotions),
  views: many(adViews),
  messages: many(messages),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  user1: one(users, { fields: [chats.user1Id], references: [users.id], relationName: "User1Chats" }),
  user2: one(users, { fields: [chats.user2Id], references: [users.id], relationName: "User2Chats" }),
  ad: one(ads, { fields: [chats.adId], references: [ads.id] }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, { fields: [messages.senderId], references: [users.id], relationName: "SentMessages" }),
  receiver: one(users, { fields: [messages.receiverId], references: [users.id], relationName: "ReceivedMessages" }),
  ad: one(ads, { fields: [messages.adId], references: [ads.id] }),
  chat: one(chats, { fields: [messages.conversationId], references: [chats.id] }),
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, { fields: [wishlists.userId], references: [users.id] }),
  ad: one(ads, { fields: [wishlists.adId], references: [ads.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  reviewer: one(users, { fields: [reviews.reviewerId], references: [users.id], relationName: "ReviewsGiven" }),
  user: one(users, { fields: [reviews.userId], references: [users.id], relationName: "ReviewsReceived" }),
  ad: one(ads, { fields: [reviews.adId], references: [ads.id] }),
}));

export const userFollowsRelations = relations(userFollows, ({ one }) => ({
  follower: one(users, { fields: [userFollows.followerId], references: [users.id], relationName: "UserFollowing" }),
  following: one(users, { fields: [userFollows.followingId], references: [users.id], relationName: "UserFollowers" }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, { fields: [wallets.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const walletTransactionsRelations = relations(transactions, ({ one }) => ({
  wallet: one(wallets, { fields: [transactions.walletId], references: [wallets.id] }),
}));

export const adPromotionsRelations = relations(adPromotions, ({ one }) => ({
  ad: one(ads, { fields: [adPromotions.adId], references: [ads.id] }),
}));

export const aiChatsRelations = relations(aiChats, ({ one, many }) => ({
  user: one(users, { fields: [aiChats.userId], references: [users.id] }),
  messages: many(aiMessages),
}));

export const aiMessagesRelations = relations(aiMessages, ({ one }) => ({
  chat: one(aiChats, { fields: [aiMessages.sessionId], references: [aiChats.id] }),
}));

export const adViewsRelations = relations(adViews, ({ one }) => ({
  ad: one(ads, { fields: [adViews.adId], references: [ads.id] }),
  user: one(users, { fields: [adViews.userId], references: [users.id] }),
}));

export const blockedUsersRelations = relations(blockedUsers, ({ one }) => ({
  blocker: one(users, { fields: [blockedUsers.blockerId], references: [users.id], relationName: "UserBlocked" }),
  blocked: one(users, { fields: [blockedUsers.blockedId], references: [users.id], relationName: "UserBlockedBy" }),
}));

export const tempImagesRelations = relations(tempImages, ({ one }) => ({
  user: one(users, { fields: [tempImages.userId], references: [users.id] }),
}));

export const reportIssuesRelations = relations(reportIssues, ({ one }) => ({
  user: one(users, { fields: [reportIssues.userId], references: [users.id] }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "CategoryHierarchy",
  }),
  children: many(categories, {
    relationName: "CategoryHierarchy",
  }),
  filterUses: many(filterUses),
}));

export const filtersRelations = relations(filters, ({ many }) => ({
  filterUses: many(filterUses),
}));

export const filterUsesRelations = relations(filterUses, ({ one }) => ({
  category: one(categories, {
    fields: [filterUses.categoryId],
    references: [categories.id],
  }),
  filter: one(filters, {
    fields: [filterUses.filterId],
    references: [filters.id],
  }),
}));

export const countriesRelations = relations(countries, ({ many }) => ({
  cities: many(cities),
}));

export const citiesRelations = relations(cities, ({ one }) => ({
  country: one(countries, {
    fields: [cities.countryId],
    references: [countries.id],
  }),
}));

export const pushTokens = pgTable("PushToken", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

export const pushTokensRelations = relations(pushTokens, ({ one }) => ({
  user: one(users, { fields: [pushTokens.userId], references: [users.id] }),
}));

export const sales = pgTable("Sale", {
  id: serial("id").primaryKey(),
  sellerId: integer("sellerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  adId: integer("adId"),
  title: text("title").notNull(),
  price: doublePrecision("price"),
  currency: text("currency"),
  category: text("category").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const salesRelations = relations(sales, ({ one }) => ({
  seller: one(users, { fields: [sales.sellerId], references: [users.id] }),
}));

export const notificationPreferences = pgTable("NotificationPreference", {
  userId: integer("userId").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  messages: boolean("messages").notNull().default(true),
  expiredAds: boolean("expiredAds").notNull().default(true),
  expiredPromotions: boolean("expiredPromotions").notNull().default(true),
  followedAds: boolean("followedAds").notNull().default(true),
  newFollowers: boolean("newFollowers").notNull().default(true),
  newReviews: boolean("newReviews").notNull().default(true),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, { fields: [notificationPreferences.userId], references: [users.id] }),
}));

