import { bigint, pgTable, varchar } from "drizzle-orm/pg-core";

export const category = pgTable("category", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
});
