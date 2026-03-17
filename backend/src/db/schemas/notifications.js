import {
  bigint,
  boolean,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { shopOwners } from "./shop-owners";
import { users } from "./users";
import { notificationTypes } from "./notification-types";

export const notifications = pgTable("notifications", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),

  notificationTypeId: bigint("notification_type_id", { mode: "number" })
    .notNull()
    .references(() => notificationTypes.id),

  fromId: bigint("from_id", { mode: "number" })
    .notNull()
    .references(() => users.id),

  toId: bigint("to_id", { mode: "number" })
    .notNull()
    .references(() => users.id),

  message: varchar("message", { length: 500 }).notNull(),

  isRead: boolean("is_read").notNull().default(false),

  shopId: bigint("shop_id", { mode: "number" })
    .notNull()
    .references(() => shopOwners.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
