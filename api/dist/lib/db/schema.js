"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriesRelations = exports.reportIssuesRelations = exports.tempImagesRelations = exports.blockedUsersRelations = exports.adViewsRelations = exports.aiMessagesRelations = exports.aiChatsRelations = exports.adPromotionsRelations = exports.walletTransactionsRelations = exports.walletsRelations = exports.notificationsRelations = exports.userFollowsRelations = exports.reviewsRelations = exports.wishlistsRelations = exports.messagesRelations = exports.chatsRelations = exports.adsRelations = exports.draftsRelations = exports.usersRelations = exports.cities = exports.countries = exports.brands = exports.filterUses = exports.filters = exports.categories = exports.pricing = exports.reportIssues = exports.aiMessages = exports.aiChats = exports.adViews = exports.reports = exports.transactions = exports.wallets = exports.blockedUsers = exports.notifications = exports.userFollows = exports.reviews = exports.wishlists = exports.messages = exports.chats = exports.adPromotions = exports.tempImages = exports.drafts = exports.ads = exports.users = exports.reportTargetTypeEnum = exports.promotionTypeEnum = exports.planTypeEnum = exports.transactionTypeEnum = exports.adStatusEnum = void 0;
exports.notificationPreferencesRelations = exports.notificationPreferences = exports.salesRelations = exports.sales = exports.pushTokensRelations = exports.pushTokens = exports.citiesRelations = exports.countriesRelations = exports.filterUsesRelations = exports.filtersRelations = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
exports.adStatusEnum = (0, pg_core_1.pgEnum)("AdStatus", ["ACTIVE", "EXPIRED", "DELETED", "DEACTIVATED", "DRAFT"]);
exports.transactionTypeEnum = (0, pg_core_1.pgEnum)("TransactionType", ["DEPOSIT", "SPEND", "REFUND", "PLAN_PURCHASE"]);
exports.planTypeEnum = (0, pg_core_1.pgEnum)("PlanType", ["FREE", "PLUS", "PRO", "ULTRA"]);
exports.promotionTypeEnum = (0, pg_core_1.pgEnum)("PromotionType", ["FEATURED", "PRIORITY", "TOP", "SEARCH", "COMBO"]);
exports.reportTargetTypeEnum = (0, pg_core_1.pgEnum)("ReportTargetType", ["USER", "AD", "MESSAGE", "REVIEW"]);
exports.users = (0, pg_core_1.pgTable)("User", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    password: (0, pg_core_1.text)("password"),
    username: (0, pg_core_1.text)("username").unique(),
    fullName: (0, pg_core_1.text)("fullName"),
    description: (0, pg_core_1.text)("description"),
    country: (0, pg_core_1.text)("country"),
    city: (0, pg_core_1.text)("city"),
    address: (0, pg_core_1.text)("address"),
    phone: (0, pg_core_1.text)("phone"),
    birthDate: (0, pg_core_1.timestamp)("birthDate", { mode: "date" }),
    profileImg: (0, pg_core_1.text)("profileImg"),
    image: (0, pg_core_1.text)("image"),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt", { mode: "date" }).notNull().defaultNow(),
    createdAt: (0, pg_core_1.timestamp)("createdAt", { mode: "date" }).notNull().defaultNow(),
    isDeactivated: (0, pg_core_1.boolean)("isDeactivated").notNull().default(false),
    supabaseId: (0, pg_core_1.text)("supabaseId").unique(),
}, (table) => [
    (0, pg_core_1.index)("User_createdAt_idx").on(table.createdAt)
]);
exports.ads = (0, pg_core_1.pgTable)("Ad", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    price: (0, pg_core_1.doublePrecision)("price"),
    currency: (0, pg_core_1.text)("currency"),
    isPriceOnRequest: (0, pg_core_1.boolean)("isPriceOnRequest").notNull().default(false),
    isReserved: (0, pg_core_1.boolean)("isReserved").notNull().default(false),
    showAddress: (0, pg_core_1.boolean)("showAddress").notNull().default(true),
    showPhone: (0, pg_core_1.boolean)("showPhone").notNull().default(true),
    category: (0, pg_core_1.text)("category").notNull(),
    country: (0, pg_core_1.text)("country").notNull(),
    city: (0, pg_core_1.text)("city").notNull(),
    address: (0, pg_core_1.text)("address"),
    lat: (0, pg_core_1.doublePrecision)("lat"),
    lng: (0, pg_core_1.doublePrecision)("lng"),
    phone: (0, pg_core_1.text)("phone"),
    images: (0, pg_core_1.text)("images").array().notNull(),
    attributes: (0, pg_core_1.jsonb)("attributes"),
    status: (0, exports.adStatusEnum)("status").notNull().default("ACTIVE"),
    userId: (0, pg_core_1.integer)("userId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt", { mode: "date" }).notNull().defaultNow(),
    expiresAt: (0, pg_core_1.timestamp)("expiresAt", { mode: "date" }).notNull(),
    deletedAt: (0, pg_core_1.timestamp)("deletedAt", { mode: "date" }),
    createdAt: (0, pg_core_1.timestamp)("createdAt", { mode: "date" }).notNull().defaultNow(),
}, (table) => [
    (0, pg_core_1.index)("Ad_status_expiresAt_idx").on(table.status, table.expiresAt),
    (0, pg_core_1.index)("Ad_createdAt_idx").on(table.createdAt),
    (0, pg_core_1.index)("Ad_userId_idx").on(table.userId),
    (0, pg_core_1.index)("Ad_category_idx").on(table.category),
    (0, pg_core_1.index)("Ad_city_idx").on(table.city)
]);
exports.drafts = (0, pg_core_1.pgTable)("Draft", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.text)("title"),
    description: (0, pg_core_1.text)("description"),
    price: (0, pg_core_1.doublePrecision)("price"),
    currency: (0, pg_core_1.text)("currency"),
    isPriceOnRequest: (0, pg_core_1.boolean)("isPriceOnRequest").notNull().default(false),
    showAddress: (0, pg_core_1.boolean)("showAddress").notNull().default(true),
    showPhone: (0, pg_core_1.boolean)("showPhone").notNull().default(true),
    category: (0, pg_core_1.text)("category"),
    country: (0, pg_core_1.text)("country").notNull().default("Srbija"),
    city: (0, pg_core_1.text)("city"),
    address: (0, pg_core_1.text)("address"),
    lat: (0, pg_core_1.doublePrecision)("lat"),
    lng: (0, pg_core_1.doublePrecision)("lng"),
    phone: (0, pg_core_1.text)("phone"),
    images: (0, pg_core_1.text)("images").array().notNull().default([]),
    attributes: (0, pg_core_1.jsonb)("attributes").default({}),
    userId: (0, pg_core_1.integer)("userId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt", { mode: "date" }).notNull().defaultNow(),
    createdAt: (0, pg_core_1.timestamp)("createdAt", { mode: "date" }).notNull().defaultNow(),
}, (table) => [
    (0, pg_core_1.index)("Draft_userId_idx").on(table.userId),
]);
exports.tempImages = (0, pg_core_1.pgTable)("TempImage", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    fileId: (0, pg_core_1.text)("fileId").notNull(),
    url: (0, pg_core_1.text)("url").notNull(),
    userId: (0, pg_core_1.integer)("userId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    isPublished: (0, pg_core_1.boolean)("isPublished").notNull().default(false),
    imageType: (0, pg_core_1.text)("imageType"),
    createdAt: (0, pg_core_1.timestamp)("createdAt", { mode: "date" }).notNull().defaultNow(),
});
exports.adPromotions = (0, pg_core_1.pgTable)("AdPromotion", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    adId: (0, pg_core_1.integer)("adId").notNull().references(() => exports.ads.id, { onDelete: "cascade" }),
    type: (0, exports.promotionTypeEnum)("type").notNull(),
    expiresAt: (0, pg_core_1.timestamp)("expiresAt", { mode: "date" }).notNull(),
    createdAt: (0, pg_core_1.timestamp)("createdAt", { mode: "date" }).notNull().defaultNow(),
});
exports.chats = (0, pg_core_1.pgTable)("Chat", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    user1Id: (0, pg_core_1.integer)("user1Id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    user2Id: (0, pg_core_1.integer)("user2Id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    adId: (0, pg_core_1.integer)("adId").references(() => exports.ads.id, { onDelete: "cascade" }),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt", { mode: "date" }).notNull().defaultNow(),
    createdAt: (0, pg_core_1.timestamp)("createdAt", { mode: "date" }).notNull().defaultNow(),
}, (t) => [
    (0, pg_core_1.uniqueIndex)("Chat_user1Id_user2Id_adId_key").on(t.user1Id, t.user2Id, t.adId)
]);
exports.messages = (0, pg_core_1.pgTable)("Message", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    senderId: (0, pg_core_1.integer)("senderId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    receiverId: (0, pg_core_1.integer)("receiverId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    adId: (0, pg_core_1.integer)("adId").references(() => exports.ads.id, { onDelete: "cascade" }),
    content: (0, pg_core_1.text)("content").notNull(),
    conversationId: (0, pg_core_1.text)("conversationId").notNull().references(() => exports.chats.id, { onDelete: "cascade" }),
    readAt: (0, pg_core_1.timestamp)("readAt", { mode: "date" }),
    likedAt: (0, pg_core_1.timestamp)("likedAt", { mode: "date" }),
    replyToId: (0, pg_core_1.integer)("replyToId"),
    replyToContent: (0, pg_core_1.text)("replyToContent"),
    editedAt: (0, pg_core_1.timestamp)("editedAt", { mode: "date" }),
    createdAt: (0, pg_core_1.timestamp)("createdAt", { mode: "date" }).notNull().defaultNow(),
});
exports.wishlists = (0, pg_core_1.pgTable)("Wishlist", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("userId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    adId: (0, pg_core_1.integer)("adId").notNull().references(() => exports.ads.id, { onDelete: "cascade" }),
    createdAt: (0, pg_core_1.timestamp)("createdAt", { mode: "date" }).notNull().defaultNow(),
}, (t) => [
    (0, pg_core_1.uniqueIndex)("Wishlist_userId_adId_key").on(t.userId, t.adId)
]);
exports.reviews = (0, pg_core_1.pgTable)("Review", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    rating: (0, pg_core_1.integer)("rating").notNull(),
    comment: (0, pg_core_1.text)("comment"),
    reviewerId: (0, pg_core_1.integer)("reviewerId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    userId: (0, pg_core_1.integer)("userId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    adId: (0, pg_core_1.integer)("adId").references(() => exports.ads.id, { onDelete: "cascade" }),
    createdAt: (0, pg_core_1.timestamp)("createdAt", { mode: "date" }).notNull().defaultNow(),
}, (t) => [
    (0, pg_core_1.uniqueIndex)("Review_reviewerId_userId_adId_key").on(t.reviewerId, t.userId, t.adId)
]);
exports.userFollows = (0, pg_core_1.pgTable)("UserFollow", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    followerId: (0, pg_core_1.integer)("followerId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    followingId: (0, pg_core_1.integer)("followingId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    createdAt: (0, pg_core_1.timestamp)("createdAt", { mode: "date" }).notNull().defaultNow(),
}, (t) => [
    (0, pg_core_1.uniqueIndex)("UserFollow_followerId_followingId_key").on(t.followerId, t.followingId)
]);
exports.notifications = (0, pg_core_1.pgTable)("Notification", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("userId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    type: (0, pg_core_1.text)("type").notNull(),
    title: (0, pg_core_1.text)("title").notNull(),
    body: (0, pg_core_1.text)("body").notNull(),
    isRead: (0, pg_core_1.boolean)("isRead").notNull().default(false),
    readAt: (0, pg_core_1.timestamp)("readAt", { mode: "date" }),
    imageUrl: (0, pg_core_1.text)("imageUrl"),
    actionUrl: (0, pg_core_1.text)("actionUrl"),
    senderId: (0, pg_core_1.integer)("senderId"),
    adId: (0, pg_core_1.integer)("adId"),
    reviewId: (0, pg_core_1.integer)("reviewId"),
    messageId: (0, pg_core_1.integer)("messageId"),
    createdAt: (0, pg_core_1.timestamp)("createdAt", { mode: "date" }).notNull().defaultNow(),
    expiresAt: (0, pg_core_1.timestamp)("expiresAt", { mode: "date" }).notNull(),
});
exports.blockedUsers = (0, pg_core_1.pgTable)("BlockedUser", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    blockerId: (0, pg_core_1.integer)("blockerId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    blockedId: (0, pg_core_1.integer)("blockedId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    createdAt: (0, pg_core_1.timestamp)("createdAt", { mode: "date" }).notNull().defaultNow(),
}, (t) => [
    (0, pg_core_1.uniqueIndex)("BlockedUser_blockerId_blockedId_key").on(t.blockerId, t.blockedId)
]);
exports.wallets = (0, pg_core_1.pgTable)("Wallet", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("userId").notNull().unique().references(() => exports.users.id, { onDelete: "cascade" }),
    balance: (0, pg_core_1.integer)("balance").notNull().default(0),
    plan: (0, exports.planTypeEnum)("plan"),
    planExpiresAt: (0, pg_core_1.timestamp)("planExpiresAt", { mode: "date" }),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt", { mode: "date" }).notNull().defaultNow(),
    createdAt: (0, pg_core_1.timestamp)("createdAt", { mode: "date" }).notNull().defaultNow(),
});
exports.transactions = (0, pg_core_1.pgTable)("Transaction", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    walletId: (0, pg_core_1.integer)("walletId").notNull().references(() => exports.wallets.id, { onDelete: "cascade" }),
    amount: (0, pg_core_1.integer)("amount").notNull(),
    type: (0, exports.transactionTypeEnum)("type").notNull(),
    referenceType: (0, pg_core_1.text)("referenceType"),
    referenceId: (0, pg_core_1.integer)("referenceId"),
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("createdAt", { mode: "date" }).notNull().defaultNow(),
});
exports.reports = (0, pg_core_1.pgTable)("Report", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("userId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    targetType: (0, exports.reportTargetTypeEnum)("targetType").notNull(),
    targetId: (0, pg_core_1.integer)("targetId").notNull(),
    reason: (0, pg_core_1.text)("reason").notNull(),
    description: (0, pg_core_1.text)("description"),
    status: (0, pg_core_1.text)("status").notNull().default("pending"),
    createdAt: (0, pg_core_1.timestamp)("createdAt", { mode: "date" }).notNull().defaultNow(),
});
exports.adViews = (0, pg_core_1.pgTable)("AdView", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    adId: (0, pg_core_1.integer)("adId").notNull().references(() => exports.ads.id, { onDelete: "cascade" }),
    userId: (0, pg_core_1.integer)("userId").references(() => exports.users.id, { onDelete: "cascade" }),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt", { mode: "date" }).notNull().defaultNow(),
    createdAt: (0, pg_core_1.timestamp)("createdAt", { mode: "date" }).notNull().defaultNow(),
}, (t) => [
    (0, pg_core_1.uniqueIndex)("AdView_userId_adId_key").on(t.userId, t.adId)
]);
exports.aiChats = (0, pg_core_1.pgTable)("AiChat", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto_1.default.randomUUID()),
    userId: (0, pg_core_1.integer)("userId").references(() => exports.users.id, { onDelete: "cascade" }),
    title: (0, pg_core_1.text)("title").notNull().default("Novi razgovor"),
    createdAt: (0, pg_core_1.timestamp)("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt", { mode: "date" }).notNull().defaultNow(),
});
exports.aiMessages = (0, pg_core_1.pgTable)("AiMessage", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    sessionId: (0, pg_core_1.text)("sessionId").notNull().references(() => exports.aiChats.id, { onDelete: "cascade" }),
    role: (0, pg_core_1.text)("role").notNull(),
    content: (0, pg_core_1.text)("content"),
    toolCalls: (0, pg_core_1.json)("toolCalls"),
    thumbUp: (0, pg_core_1.boolean)("thumbUp").default(false),
    thumbDown: (0, pg_core_1.boolean)("thumbDown").default(false),
    createdAt: (0, pg_core_1.timestamp)("createdAt", { mode: "date" }).notNull().defaultNow(),
});
exports.reportIssues = (0, pg_core_1.pgTable)("ReportIssue", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("userId").references(() => exports.users.id, { onDelete: "cascade" }),
    targetType: (0, pg_core_1.text)("targetType").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    status: (0, pg_core_1.text)("status").notNull().default("pending"),
    createdAt: (0, pg_core_1.timestamp)("createdAt", { mode: "date" }).notNull().defaultNow(),
});
exports.pricing = (0, pg_core_1.pgTable)("Pricing", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    category: (0, pg_core_1.text)("category").notNull(), // 'krediti', 'promocija', 'plan'
    name: (0, pg_core_1.text)("name").notNull(),
    price: (0, pg_core_1.doublePrecision)("price").notNull(),
    currency: (0, pg_core_1.text)("currency").notNull(), // 'EUR', 'KREDITI'
    features: (0, pg_core_1.jsonb)("features"),
    createdAt: (0, pg_core_1.timestamp)("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt", { mode: "date" }).notNull().defaultNow(),
});
exports.categories = (0, pg_core_1.pgTable)("Category", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    slug: (0, pg_core_1.text)("slug").notNull(),
    icon: (0, pg_core_1.text)("icon"),
    parentId: (0, pg_core_1.integer)("parentId"),
});
exports.filters = (0, pg_core_1.pgTable)("Filter", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    slug: (0, pg_core_1.text)("slug").notNull().unique(),
    type: (0, pg_core_1.text)("type").notNull(),
    options: (0, pg_core_1.jsonb)("options"),
    source: (0, pg_core_1.text)("source"),
    isFormRadio: (0, pg_core_1.boolean)("isFormRadio").default(false),
});
exports.filterUses = (0, pg_core_1.pgTable)("FilterUse", {
    categoryId: (0, pg_core_1.integer)("categoryId").notNull().references(() => exports.categories.id, { onDelete: "cascade" }),
    filterId: (0, pg_core_1.integer)("filterId").notNull().references(() => exports.filters.id, { onDelete: "cascade" }),
}, (t) => [
    (0, pg_core_1.primaryKey)({ columns: [t.categoryId, t.filterId] })
]);
exports.brands = (0, pg_core_1.pgTable)("Brand", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    type: (0, pg_core_1.text)("type").notNull(), // e.g. 'cars', 'motorcycles'
    brand: (0, pg_core_1.text)("brand").notNull(),
    models: (0, pg_core_1.jsonb)("models").notNull(), // Array of models
});
exports.countries = (0, pg_core_1.pgTable)("Country", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull().unique(),
    slug: (0, pg_core_1.text)("slug").notNull().unique(),
});
exports.cities = (0, pg_core_1.pgTable)("City", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    slug: (0, pg_core_1.text)("slug").notNull(),
    countryId: (0, pg_core_1.integer)("countryId").notNull().references(() => exports.countries.id, { onDelete: "cascade" }),
    lat: (0, pg_core_1.doublePrecision)("lat"),
    lng: (0, pg_core_1.doublePrecision)("lng"),
});
// Relations definitions
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many, one }) => ({
    ads: many(exports.ads),
    drafts: many(exports.drafts),
    wishlist: many(exports.wishlists),
    reviewsGiven: many(exports.reviews, { relationName: "ReviewsGiven" }),
    reviewsReceived: many(exports.reviews, { relationName: "ReviewsReceived" }),
    chats1: many(exports.chats, { relationName: "User1Chats" }),
    chats2: many(exports.chats, { relationName: "User2Chats" }),
    following: many(exports.userFollows, { relationName: "UserFollowing" }),
    followers: many(exports.userFollows, { relationName: "UserFollowers" }),
    notifications: many(exports.notifications),
    aiChats: many(exports.aiChats),
    history: many(exports.adViews),
    wallet: one(exports.wallets, { fields: [exports.users.id], references: [exports.wallets.userId] }),
    blockedUsers: many(exports.blockedUsers, { relationName: "UserBlocked" }),
    blockedBy: many(exports.blockedUsers, { relationName: "UserBlockedBy" }),
    reportIssues: many(exports.reportIssues),
    sentMessages: many(exports.messages, { relationName: "SentMessages" }),
    receivedMessages: many(exports.messages, { relationName: "ReceivedMessages" }),
    pushTokens: many(exports.pushTokens),
    sales: many(exports.sales),
    notificationPreferences: one(exports.notificationPreferences, { fields: [exports.users.id], references: [exports.notificationPreferences.userId] }),
}));
exports.draftsRelations = (0, drizzle_orm_1.relations)(exports.drafts, ({ one }) => ({
    user: one(exports.users, { fields: [exports.drafts.userId], references: [exports.users.id] }),
}));
exports.adsRelations = (0, drizzle_orm_1.relations)(exports.ads, ({ one, many }) => ({
    user: one(exports.users, { fields: [exports.ads.userId], references: [exports.users.id] }),
    wishlist: many(exports.wishlists),
    reviews: many(exports.reviews),
    chats: many(exports.chats),
    promotions: many(exports.adPromotions),
    views: many(exports.adViews),
    messages: many(exports.messages),
}));
exports.chatsRelations = (0, drizzle_orm_1.relations)(exports.chats, ({ one, many }) => ({
    user1: one(exports.users, { fields: [exports.chats.user1Id], references: [exports.users.id], relationName: "User1Chats" }),
    user2: one(exports.users, { fields: [exports.chats.user2Id], references: [exports.users.id], relationName: "User2Chats" }),
    ad: one(exports.ads, { fields: [exports.chats.adId], references: [exports.ads.id] }),
    messages: many(exports.messages),
}));
exports.messagesRelations = (0, drizzle_orm_1.relations)(exports.messages, ({ one }) => ({
    sender: one(exports.users, { fields: [exports.messages.senderId], references: [exports.users.id], relationName: "SentMessages" }),
    receiver: one(exports.users, { fields: [exports.messages.receiverId], references: [exports.users.id], relationName: "ReceivedMessages" }),
    ad: one(exports.ads, { fields: [exports.messages.adId], references: [exports.ads.id] }),
    chat: one(exports.chats, { fields: [exports.messages.conversationId], references: [exports.chats.id] }),
}));
exports.wishlistsRelations = (0, drizzle_orm_1.relations)(exports.wishlists, ({ one }) => ({
    user: one(exports.users, { fields: [exports.wishlists.userId], references: [exports.users.id] }),
    ad: one(exports.ads, { fields: [exports.wishlists.adId], references: [exports.ads.id] }),
}));
exports.reviewsRelations = (0, drizzle_orm_1.relations)(exports.reviews, ({ one }) => ({
    reviewer: one(exports.users, { fields: [exports.reviews.reviewerId], references: [exports.users.id], relationName: "ReviewsGiven" }),
    user: one(exports.users, { fields: [exports.reviews.userId], references: [exports.users.id], relationName: "ReviewsReceived" }),
    ad: one(exports.ads, { fields: [exports.reviews.adId], references: [exports.ads.id] }),
}));
exports.userFollowsRelations = (0, drizzle_orm_1.relations)(exports.userFollows, ({ one }) => ({
    follower: one(exports.users, { fields: [exports.userFollows.followerId], references: [exports.users.id], relationName: "UserFollowing" }),
    following: one(exports.users, { fields: [exports.userFollows.followingId], references: [exports.users.id], relationName: "UserFollowers" }),
}));
exports.notificationsRelations = (0, drizzle_orm_1.relations)(exports.notifications, ({ one }) => ({
    user: one(exports.users, { fields: [exports.notifications.userId], references: [exports.users.id] }),
}));
exports.walletsRelations = (0, drizzle_orm_1.relations)(exports.wallets, ({ one, many }) => ({
    user: one(exports.users, { fields: [exports.wallets.userId], references: [exports.users.id] }),
    transactions: many(exports.transactions),
}));
exports.walletTransactionsRelations = (0, drizzle_orm_1.relations)(exports.transactions, ({ one }) => ({
    wallet: one(exports.wallets, { fields: [exports.transactions.walletId], references: [exports.wallets.id] }),
}));
exports.adPromotionsRelations = (0, drizzle_orm_1.relations)(exports.adPromotions, ({ one }) => ({
    ad: one(exports.ads, { fields: [exports.adPromotions.adId], references: [exports.ads.id] }),
}));
exports.aiChatsRelations = (0, drizzle_orm_1.relations)(exports.aiChats, ({ one, many }) => ({
    user: one(exports.users, { fields: [exports.aiChats.userId], references: [exports.users.id] }),
    messages: many(exports.aiMessages),
}));
exports.aiMessagesRelations = (0, drizzle_orm_1.relations)(exports.aiMessages, ({ one }) => ({
    chat: one(exports.aiChats, { fields: [exports.aiMessages.sessionId], references: [exports.aiChats.id] }),
}));
exports.adViewsRelations = (0, drizzle_orm_1.relations)(exports.adViews, ({ one }) => ({
    ad: one(exports.ads, { fields: [exports.adViews.adId], references: [exports.ads.id] }),
    user: one(exports.users, { fields: [exports.adViews.userId], references: [exports.users.id] }),
}));
exports.blockedUsersRelations = (0, drizzle_orm_1.relations)(exports.blockedUsers, ({ one }) => ({
    blocker: one(exports.users, { fields: [exports.blockedUsers.blockerId], references: [exports.users.id], relationName: "UserBlocked" }),
    blocked: one(exports.users, { fields: [exports.blockedUsers.blockedId], references: [exports.users.id], relationName: "UserBlockedBy" }),
}));
exports.tempImagesRelations = (0, drizzle_orm_1.relations)(exports.tempImages, ({ one }) => ({
    user: one(exports.users, { fields: [exports.tempImages.userId], references: [exports.users.id] }),
}));
exports.reportIssuesRelations = (0, drizzle_orm_1.relations)(exports.reportIssues, ({ one }) => ({
    user: one(exports.users, { fields: [exports.reportIssues.userId], references: [exports.users.id] }),
}));
exports.categoriesRelations = (0, drizzle_orm_1.relations)(exports.categories, ({ one, many }) => ({
    parent: one(exports.categories, {
        fields: [exports.categories.parentId],
        references: [exports.categories.id],
        relationName: "CategoryHierarchy",
    }),
    children: many(exports.categories, {
        relationName: "CategoryHierarchy",
    }),
    filterUses: many(exports.filterUses),
}));
exports.filtersRelations = (0, drizzle_orm_1.relations)(exports.filters, ({ many }) => ({
    filterUses: many(exports.filterUses),
}));
exports.filterUsesRelations = (0, drizzle_orm_1.relations)(exports.filterUses, ({ one }) => ({
    category: one(exports.categories, {
        fields: [exports.filterUses.categoryId],
        references: [exports.categories.id],
    }),
    filter: one(exports.filters, {
        fields: [exports.filterUses.filterId],
        references: [exports.filters.id],
    }),
}));
exports.countriesRelations = (0, drizzle_orm_1.relations)(exports.countries, ({ many }) => ({
    cities: many(exports.cities),
}));
exports.citiesRelations = (0, drizzle_orm_1.relations)(exports.cities, ({ one }) => ({
    country: one(exports.countries, {
        fields: [exports.cities.countryId],
        references: [exports.countries.id],
    }),
}));
exports.pushTokens = (0, pg_core_1.pgTable)("PushToken", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("userId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    token: (0, pg_core_1.text)("token").notNull().unique(),
    createdAt: (0, pg_core_1.timestamp)("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt", { mode: "date" }).notNull().defaultNow(),
});
exports.pushTokensRelations = (0, drizzle_orm_1.relations)(exports.pushTokens, ({ one }) => ({
    user: one(exports.users, { fields: [exports.pushTokens.userId], references: [exports.users.id] }),
}));
exports.sales = (0, pg_core_1.pgTable)("Sale", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    sellerId: (0, pg_core_1.integer)("sellerId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    adId: (0, pg_core_1.integer)("adId"),
    title: (0, pg_core_1.text)("title").notNull(),
    price: (0, pg_core_1.doublePrecision)("price"),
    currency: (0, pg_core_1.text)("currency"),
    category: (0, pg_core_1.text)("category").notNull(),
    createdAt: (0, pg_core_1.timestamp)("createdAt", { mode: "date" }).notNull().defaultNow(),
});
exports.salesRelations = (0, drizzle_orm_1.relations)(exports.sales, ({ one }) => ({
    seller: one(exports.users, { fields: [exports.sales.sellerId], references: [exports.users.id] }),
}));
exports.notificationPreferences = (0, pg_core_1.pgTable)("NotificationPreference", {
    userId: (0, pg_core_1.integer)("userId").primaryKey().references(() => exports.users.id, { onDelete: "cascade" }),
    messages: (0, pg_core_1.boolean)("messages").notNull().default(true),
    expiredAds: (0, pg_core_1.boolean)("expiredAds").notNull().default(true),
    expiredPromotions: (0, pg_core_1.boolean)("expiredPromotions").notNull().default(true),
    followedAds: (0, pg_core_1.boolean)("followedAds").notNull().default(true),
    newFollowers: (0, pg_core_1.boolean)("newFollowers").notNull().default(true),
    newReviews: (0, pg_core_1.boolean)("newReviews").notNull().default(true),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt", { mode: "date" }).notNull().defaultNow(),
});
exports.notificationPreferencesRelations = (0, drizzle_orm_1.relations)(exports.notificationPreferences, ({ one }) => ({
    user: one(exports.users, { fields: [exports.notificationPreferences.userId], references: [exports.users.id] }),
}));
