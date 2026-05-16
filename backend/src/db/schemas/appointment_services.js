import { bigint, pgTable, primaryKey, timestamp } from "drizzle-orm/pg-core";
import { appointments } from "./appointments.js";
import { services } from "./services.js";

export const appointmentServices = pgTable(
  "appointment_services",
  {
    appointmentId: bigint("appointment_id", { mode: "number" })
      .notNull()
      .references(() => appointments.id),

    serviceId: bigint("service_id", { mode: "number" })
      .notNull()
      .references(() => services.id),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.appointmentId, table.serviceId],
      name: "appointment_services_appointment_id_service_id_pk",
    }),
  })
);
