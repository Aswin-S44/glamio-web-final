import { pgTable, bigint, varchar } from "drizzle-orm/pg-core";

export const appointmentStatus = pgTable("appointment_status", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
});
