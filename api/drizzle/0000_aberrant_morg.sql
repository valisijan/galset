CREATE TYPE "public"."AdStatus" AS ENUM('ACTIVE', 'EXPIRED', 'DELETED', 'DEACTIVATED');--> statement-breakpoint
CREATE TYPE "public"."PlanType" AS ENUM('FREE', 'PLUS', 'PRO', 'ULTRA');--> statement-breakpoint
CREATE TYPE "public"."PromotionType" AS ENUM('FEATURED', 'PRIORITY', 'TOP', 'SEARCH', 'COMBO');--> statement-breakpoint
CREATE TYPE "public"."ReportTargetType" AS ENUM('USER', 'AD', 'MESSAGE');--> statement-breakpoint
CREATE TYPE "public"."TransactionType" AS ENUM('DEPOSIT', 'SPEND', 'REFUND', 'PLAN_PURCHASE');--> statement-breakpoint
CREATE TABLE "Account" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "AdPromotion" (
	"id" serial PRIMARY KEY NOT NULL,
	"adId" integer NOT NULL,
	"type" "PromotionType" NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "AdView" (
	"id" serial PRIMARY KEY NOT NULL,
	"adId" integer NOT NULL,
	"userId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Ad" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"price" double precision,
	"currency" text,
	"isContact" boolean DEFAULT false NOT NULL,
	"condition" text,
	"isSold" boolean DEFAULT false NOT NULL,
	"category" text NOT NULL,
	"country" text NOT NULL,
	"city" text NOT NULL,
	"street" text,
	"lat" double precision,
	"lng" double precision,
	"phone" text,
	"images" text[] NOT NULL,
	"attributes" json,
	"status" "AdStatus" DEFAULT 'ACTIVE' NOT NULL,
	"userId" integer NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"deletedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "AiChatMessage" (
	"id" serial PRIMARY KEY NOT NULL,
	"sessionId" text NOT NULL,
	"role" text NOT NULL,
	"content" text,
	"toolCalls" json,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "AiChatSession" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" integer,
	"title" text DEFAULT 'Novi razgovor' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "BlockedUser" (
	"id" serial PRIMARY KEY NOT NULL,
	"blockerId" integer NOT NULL,
	"blockedId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Conversation" (
	"id" text PRIMARY KEY NOT NULL,
	"user1Id" integer NOT NULL,
	"user2Id" integer NOT NULL,
	"adId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "CreditPackage" (
	"id" serial PRIMARY KEY NOT NULL,
	"price" double precision NOT NULL,
	"credits" integer NOT NULL,
	"bonus" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "EmailVerification" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"code" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Notification" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"senderId" integer,
	"adId" integer,
	"reviewId" integer,
	"messageId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Plan" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "PlanType" NOT NULL,
	"price" double precision NOT NULL,
	"adsLimit" integer NOT NULL,
	"renewLimit" integer NOT NULL,
	"featuredLimit" integer NOT NULL,
	"priorityLimit" integer NOT NULL,
	"topLimit" integer NOT NULL,
	"searchLimit" integer NOT NULL,
	"comboLimit" integer NOT NULL,
	"noAds" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Plan_type_unique" UNIQUE("type")
);
--> statement-breakpoint
CREATE TABLE "Report" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"targetType" "ReportTargetType" NOT NULL,
	"targetId" integer NOT NULL,
	"reason" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Review" (
	"id" serial PRIMARY KEY NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"reviewerId" integer NOT NULL,
	"userId" integer NOT NULL,
	"adId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Session" (
	"id" text PRIMARY KEY NOT NULL,
	"sessionToken" text NOT NULL,
	"userId" integer NOT NULL,
	"expires" timestamp NOT NULL,
	"userAgent" text,
	"ipAddress" text,
	"deviceType" text,
	"location" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Session_sessionToken_unique" UNIQUE("sessionToken")
);
--> statement-breakpoint
CREATE TABLE "UserFollow" (
	"id" serial PRIMARY KEY NOT NULL,
	"followerId" integer NOT NULL,
	"followingId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "UserPlanUsage" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"plan" "PlanType" NOT NULL,
	"adsUsed" integer DEFAULT 0 NOT NULL,
	"renewUsed" integer DEFAULT 0 NOT NULL,
	"featuredUsed" integer DEFAULT 0 NOT NULL,
	"priorityUsed" integer DEFAULT 0 NOT NULL,
	"topUsed" integer DEFAULT 0 NOT NULL,
	"searchUsed" integer DEFAULT 0 NOT NULL,
	"comboUsed" integer DEFAULT 0 NOT NULL,
	"resetAt" timestamp NOT NULL,
	CONSTRAINT "UserPlanUsage_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text,
	"username" text,
	"fullName" text,
	"description" text,
	"country" text,
	"city" text,
	"street" text,
	"phone" text,
	"birthDate" timestamp,
	"profileImg" text,
	"emailVerified" timestamp,
	"image" text,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "User_email_unique" UNIQUE("email"),
	CONSTRAINT "User_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "VerificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "VerificationToken_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "WalletTransaction" (
	"id" serial PRIMARY KEY NOT NULL,
	"walletId" integer NOT NULL,
	"amount" integer NOT NULL,
	"type" "TransactionType" NOT NULL,
	"referenceType" text,
	"referenceId" integer,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Wallet" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"plan" "PlanType",
	"planExpiresAt" timestamp,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Wallet_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "Wishlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"adId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "AdPromotion" ADD CONSTRAINT "AdPromotion_adId_Ad_id_fk" FOREIGN KEY ("adId") REFERENCES "public"."Ad"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "AdView" ADD CONSTRAINT "AdView_adId_Ad_id_fk" FOREIGN KEY ("adId") REFERENCES "public"."Ad"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "AdView" ADD CONSTRAINT "AdView_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Ad" ADD CONSTRAINT "Ad_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "AiChatMessage" ADD CONSTRAINT "AiChatMessage_sessionId_AiChatSession_id_fk" FOREIGN KEY ("sessionId") REFERENCES "public"."AiChatSession"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "AiChatSession" ADD CONSTRAINT "AiChatSession_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "BlockedUser" ADD CONSTRAINT "BlockedUser_blockerId_User_id_fk" FOREIGN KEY ("blockerId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "BlockedUser" ADD CONSTRAINT "BlockedUser_blockedId_User_id_fk" FOREIGN KEY ("blockedId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_user1Id_User_id_fk" FOREIGN KEY ("user1Id") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_user2Id_User_id_fk" FOREIGN KEY ("user2Id") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_adId_Ad_id_fk" FOREIGN KEY ("adId") REFERENCES "public"."Ad"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_User_id_fk" FOREIGN KEY ("reviewerId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Review" ADD CONSTRAINT "Review_adId_Ad_id_fk" FOREIGN KEY ("adId") REFERENCES "public"."Ad"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserFollow" ADD CONSTRAINT "UserFollow_followerId_User_id_fk" FOREIGN KEY ("followerId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserFollow" ADD CONSTRAINT "UserFollow_followingId_User_id_fk" FOREIGN KEY ("followingId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserPlanUsage" ADD CONSTRAINT "UserPlanUsage_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_walletId_Wallet_id_fk" FOREIGN KEY ("walletId") REFERENCES "public"."Wallet"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_adId_Ad_id_fk" FOREIGN KEY ("adId") REFERENCES "public"."Ad"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account" USING btree ("provider","providerAccountId");--> statement-breakpoint
CREATE UNIQUE INDEX "AdView_userId_adId_key" ON "AdView" USING btree ("userId","adId");--> statement-breakpoint
CREATE UNIQUE INDEX "BlockedUser_blockerId_blockedId_key" ON "BlockedUser" USING btree ("blockerId","blockedId");--> statement-breakpoint
CREATE UNIQUE INDEX "Conversation_user1Id_user2Id_adId_key" ON "Conversation" USING btree ("user1Id","user2Id","adId");--> statement-breakpoint
CREATE UNIQUE INDEX "Review_reviewerId_userId_adId_key" ON "Review" USING btree ("reviewerId","userId","adId");--> statement-breakpoint
CREATE UNIQUE INDEX "UserFollow_followerId_followingId_key" ON "UserFollow" USING btree ("followerId","followingId");--> statement-breakpoint
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken" USING btree ("identifier","token");--> statement-breakpoint
CREATE UNIQUE INDEX "Wishlist_userId_adId_key" ON "Wishlist" USING btree ("userId","adId");