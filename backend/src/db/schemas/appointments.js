import {
  bigint,
  date,
  integer,
  json,
  pgTable,
  timestamp,
} from "drizzle-orm/pg-core";
import { appointmentStatus } from "./appointment_status.js";
import { users } from "./users.js";
import { experts } from "./experts.js";
import { slots } from "./slots.js";
import { shopOwners } from "./shop-owners.js";

export const appointments = pgTable("appointments", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),

  statusId: bigint("status_id", { mode: "number" })
    .notNull()
    .references(() => appointmentStatus.id),

  customerId: bigint("customer_id", { mode: "number" })
    .notNull()
    .references(() => users.id),

  expertId: bigint("expert_id", { mode: "number" })
    .notNull()
    .references(() => experts.id),

  slotId: bigint("slot_id", { mode: "number" })
    .notNull()
    .references(() => slots.id),

  shopId: bigint("shop_id", { mode: "number" })
    .notNull()
    .references(() => shopOwners.id),

  confirmedAt: date("confirmed_at"),

  rate: integer("rate").notNull().default(0),

  serviceIds: json("service_ids").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
