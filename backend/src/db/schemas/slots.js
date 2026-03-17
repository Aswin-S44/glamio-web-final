import {
  bigint,
  boolean,
  date,
  integer,
  pgTable,
  time,
  timestamp,
} from "drizzle-orm/pg-core";
import { shopOwners } from "./shop-owners.js";

export const slots = pgTable("slots", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),

  shopId: bigint("shop_id", { mode: "number" })
    .notNull()
    .references(() => shopOwners.id),

  slotDate: date("slot_date").notNull(),

  startTime: time("start_time").notNull(),

  endTime: time("end_time").notNull(),

  maxCapacity: integer("max_capacity").notNull(),

  bookedCount: integer("booked_count").notNull().default(0),

  isAvailable: boolean("is_available").notNull().default(true),

  isRecurring: boolean("is_recurring").notNull().default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
