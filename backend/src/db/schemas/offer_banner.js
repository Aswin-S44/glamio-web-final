import {
  bigint,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { shopOwners } from "./shop-owners.js";
export const offerBanner = pgTable("offer_banner", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  offer: text("offer").notNull(),
  fromDate: timestamp("from_date").notNull(),
  toDate: timestamp("to_date").notNull(),
  buttonText: varchar("button_text", { length: 100 }).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  shopOwnerId: bigint("shop_owner_id", { mode: "number" })
    .notNull()
    .references(() => shopOwners.id),
});
