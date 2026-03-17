import {
  bigint,
  decimal,
  integer,
  pgTable,
  timestamp,
  date,
} from "drizzle-orm/pg-core";
import { shopOwners } from "./shop-owners";

export const shopStatistics = pgTable("shop_statistics", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),

  shopId: bigint("shop_id", { mode: "number" })
    .notNull()
    .references(() => shopOwners.id),

  statDate: date("stat_date").notNull(),

  dailyRevenue: decimal("daily_revenue", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),

  appointmentsCount: integer("appointments_count").notNull().default(0),

  uniqueCustomersCount: integer("unique_customers_count").notNull().default(0),

  totalAccumulatedRevenue: decimal("total_accumulated_revenue", {
    precision: 15,
    scale: 2,
  })
    .notNull()
    .default("0.00"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
