import { and, eq, sql } from "drizzle-orm";

import { users } from "../../db/schemas/users.js";
import { shopOwners } from "../../db/schemas/shop-owners.js";
import { DEFAULT_SHOP_ID } from "../../constants/constants.js";
import { services } from "../../db/schemas/services.js";
import { offers } from "../../db/schemas/offers.js";
import { experts } from "../../db/schemas/experts.js";
import { appointments } from "../../db/schemas/appointments.js";
import { db } from "../../db/index.js";

export const getAllShopsDB = async () => {
  // Query FROM shopOwners (source of truth) — avoids missing shops
  // whose users have the wrong userTypeId.
  const result = await db
    .select({
      user: users,
      shop: shopOwners,
    })
    .from(shopOwners)
    .leftJoin(users, eq(shopOwners.userId, users.id))
    .where(
      and(
        eq(shopOwners.isOnboarded, true),
        eq(shopOwners.isProfileCompleted, true)
      )
    );

  return result ?? [];
};
export const getShopByIdDB = async (id) => {
  const rows = await db
    .select({
      user: users,
      shop: shopOwners,
      service: services,
      offer: offers,
    })
    .from(users)
    .leftJoin(shopOwners, eq(shopOwners.userId, users.id))
    .leftJoin(services, eq(services.shopId, shopOwners.id))
    .leftJoin(offers, eq(offers.shopId, shopOwners.id))
    .where(eq(shopOwners.id, id));

  if (!rows.length) return null;

  const { user, shop } = rows[0];

  return {
    user,
    shop,
    services: rows.map((r) => r.service).filter(Boolean),
    offers: rows.map((r) => r.offer).filter(Boolean),
  };
};

export const getAllExpertsByShopIdDB = async (shopId) => {
  const result = await db
    .select()
    .from(experts)
    .where(eq(experts.shopId, shopId));

  return result ?? [];
};

export const createBookingDB = (data) => {
  return db.insert(appointments).values(data);
};

export const findBookingDB = (data) => {
  return db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.shopId, data.shopId),
        eq(appointments.statusId, data.statusId),
        eq(appointments.customerId, data.customerId),
        eq(appointments.expertId, data.expertId),
        eq(appointments.slotId, data.slotId)
        // sql`${appointments.serviceIds} = ${data.serviceIds}`
      )
    )
    .limit(1);
};

export const getServiceDetailsByIdDB = (id) => {
  return db.select().from(services).where(eq(services.id, id)).limit(1);
};
