import { bigint, pgTable, primaryKey, timestamp } from "drizzle-orm/pg-core";
import { experts } from "./experts.js";
import { services } from "./services.js";

export const expertServices = pgTable(
  "expert_services",
  {
    expertId: bigint("expert_id", { mode: "number" })
      .notNull()
      .references(() => experts.id),

    serviceId: bigint("service_id", { mode: "number" })
      .notNull()
      .references(() => services.id),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.expertId, table.serviceId],
      name: "expert_services_expert_id_service_id_pk",
    }),
  })
);
