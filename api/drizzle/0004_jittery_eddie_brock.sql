CREATE TABLE "BrandModel" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"brand" text NOT NULL,
	"models" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Category" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"icon" text,
	"parentId" integer
);
--> statement-breakpoint
CREATE TABLE "CategoryFilter" (
	"categoryId" integer NOT NULL,
	"filterId" integer NOT NULL,
	CONSTRAINT "CategoryFilter_categoryId_filterId_pk" PRIMARY KEY("categoryId","filterId")
);
--> statement-breakpoint
CREATE TABLE "City" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"countryId" integer NOT NULL,
	"lat" double precision,
	"lng" double precision
);
--> statement-breakpoint
CREATE TABLE "Country" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "Country_name_unique" UNIQUE("name"),
	CONSTRAINT "Country_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "Filter" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"type" text NOT NULL,
	"options" jsonb,
	"source" text,
	CONSTRAINT "Filter_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "Notification" ADD COLUMN "readAt" timestamp;--> statement-breakpoint
ALTER TABLE "Notification" ADD COLUMN "imageUrl" text;--> statement-breakpoint
ALTER TABLE "Notification" ADD COLUMN "actionUrl" text;--> statement-breakpoint
ALTER TABLE "CategoryFilter" ADD CONSTRAINT "CategoryFilter_categoryId_Category_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CategoryFilter" ADD CONSTRAINT "CategoryFilter_filterId_Filter_id_fk" FOREIGN KEY ("filterId") REFERENCES "public"."Filter"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "City" ADD CONSTRAINT "City_countryId_Country_id_fk" FOREIGN KEY ("countryId") REFERENCES "public"."Country"("id") ON DELETE cascade ON UPDATE no action;