import { bigint, pgTable, varchar, unique } from "drizzle-orm/pg-core";

export const userTypes = pgTable(
  "user_types",
  {
    id: bigint("id", { mode: "number" })
      .generatedAlwaysAsIdentity()
      .primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
  },
  (table) => ({
    nameUnique: unique("uq_user_types_name").on(table.name),
  })
);
