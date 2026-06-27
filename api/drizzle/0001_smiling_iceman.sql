CREATE TABLE "ReportIssue" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"targetType" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "TempImage" (
	"id" serial PRIMARY KEY NOT NULL,
	"fileId" text NOT NULL,
	"url" text NOT NULL,
	"userId" integer NOT NULL,
	"isPublished" boolean DEFAULT false NOT NULL,
	"imageType" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Ad" ALTER COLUMN "attributes" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "deactivatedAt" timestamp;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "scheduledDeleteAt" timestamp;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "activationToken" text;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "activationTokenExpiry" timestamp;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "recoverToken" text;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "recoverTokenExpiry" timestamp;--> statement-breakpoint
ALTER TABLE "ReportIssue" ADD CONSTRAINT "ReportIssue_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TempImage" ADD CONSTRAINT "TempImage_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;