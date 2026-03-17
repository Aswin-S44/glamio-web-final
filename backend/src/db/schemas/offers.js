import { bigint, pgTable, timestamp, integer } from "drizzle-orm/pg-core";
import { shopOwners } from "./shop-owners.js";
import { category } from "./category.js";
import { services } from "./services.js";
import { relations } from "drizzle-orm";

export const offers = pgTable("offers", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),

  categoryId: bigint("category_id", { mode: "number" })
    .notNull()
    .references(() => category.id),

  offerPrice: integer("offer_price").notNull(),
  regularPrice: integer("regular_price").notNull(),

  serviceId: bigint("service_id", { mode: "number" })
    .notNull()
    .references(() => services.id),

  shopId: bigint("shop_id", { mode: "number" })
    .notNull()
    .references(() => shopOwners.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const offersRelations = relations(offers, ({ one }) => ({
  service: one(services, {
    fields: [offers.serviceId],
    references: [services.id],
  }),
}));
