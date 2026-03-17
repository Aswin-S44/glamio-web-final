import { bigint, pgTable, varchar } from "drizzle-orm/pg-core";

export const notificationTypes = pgTable("notification_types", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
});
