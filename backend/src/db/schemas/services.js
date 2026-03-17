import {
  bigint,
  integer,
  text,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { shopOwners } from "./shop-owners.js";
import { category } from "./category.js";

export const services = pgTable("services", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),

  name: varchar("name", { length: 256 }).notNull(),

  imageUrl: text("image_url").notNull(),

  rate: integer("rate").notNull().default(0),

  shopId: bigint("shop_id", { mode: "number" })
    .notNull()
    .references(() => shopOwners.id),

  categoryId: bigint("category_id", { mode: "number" }).references(
    () => category.id
  ),

  description: text("description"),

  duration: varchar("duration", { length: 256 }).notNull().default("60"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
