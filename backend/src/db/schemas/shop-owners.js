import {
  bigint,
  boolean,
  integer,
  pgTable,
  timestamp,
  varchar,
  decimal,
  json,
  text,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const shopOwners = pgTable("shop_owners", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),

  userId: bigint("user_id", { mode: "number" })
    .notNull()
    .references(() => users.id),

  about: text("about").notNull(),

  address: varchar("address", { length: 500 }).notNull(),

  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),

  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),

  googleReviewUrl: varchar("google_review_url", { length: 500 }),

  isOnboarded: boolean("is_onboarded").notNull().default(false),

  openingHours: json("opening_hours").notNull(),

  parlourName: varchar("parlour_name", { length: 256 }).notNull(),

  placeId: varchar("place_id", { length: 100 }),

  totalRating: integer("total_rating").notNull().default(0),

  isProfileCompleted: boolean("is_profile_completed").default(false),

  shopImage: varchar("shop_image", { length: 256 }),
});
