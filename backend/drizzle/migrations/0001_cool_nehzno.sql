ALTER TABLE "shop_owners" ALTER COLUMN "total_rating" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "shop_owners" ALTER COLUMN "shop_image" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "shop_owners" ADD COLUMN "gallery_images" json DEFAULT '[]'::json;