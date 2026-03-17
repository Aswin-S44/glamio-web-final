import { bigint, date, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { shopOwners } from "./shop-owners";

export const holidays = pgTable("holidays", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),

  date: date("date").notNull(),

  shopId: bigint("shop_id", { mode: "number" })
    .notNull()
    .references(() => shopOwners.id),

  reason: varchar("reason", { length: 256 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
