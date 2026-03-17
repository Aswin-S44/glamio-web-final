import {
  bigint,
  boolean,
  pgTable,
  timestamp,
  varchar,
  text,
} from "drizzle-orm/pg-core";
import { shopOwners } from "./shop-owners.js";

export const experts = pgTable("experts", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),

  shopId: bigint("shop_id", { mode: "number" })
    .notNull()
    .references(() => shopOwners.id),

  name: varchar("name", { length: 100 }).notNull(),
  about: text("about"),
  address: varchar("address", { length: 500 }),
  image: text("image"),

  specialist: varchar("specialist", { length: 100 }).notNull(),

  isActive: boolean("is_active").notNull().default(true),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
