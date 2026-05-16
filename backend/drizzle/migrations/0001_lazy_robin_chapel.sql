ALTER TABLE "shop_owners" ALTER COLUMN "total_rating" SET DATA TYPE numeric(3, 1);--> statement-breakpoint
ALTER TABLE "shop_owners" ALTER COLUMN "total_rating" SET DEFAULT '0';