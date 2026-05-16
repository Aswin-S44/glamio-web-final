import { and, desc, eq, sql } from "drizzle-orm";

import { users } from "../../db/schemas/users.js";
import { shopOwners } from "../../db/schemas/shop-owners.js";
import { DEFAULT_SHOP_ID } from "../../constants/constants.js";
import { services } from "../../db/schemas/services.js";
import { offers } from "../../db/schemas/offers.js";
import { experts } from "../../db/schemas/experts.js";
import { appointments } from "../../db/schemas/appointments.js";
import { db } from "../../db/index.js";
import { category } from "../../db/schemas/category.js";
import { slots } from "../../db/schemas/slots.js";
import { appointmentStatus } from "../../db/schemas/appointment_status.js";

export const getAllShopsDB = async () => {
  const result = await db
    .select({
      user: users,
      shop: shopOwners,
    })
    .from(users)
    // .where(eq(users.userTypeId, DEFAULT_SHOP_ID))
    .leftJoin(shopOwners, eq(shopOwners.userId, users.id));

  console.log("----------------", result);

  return result ?? [];
};

// export const getShopByIdDB = async (id) => {
//   const rows = await db
//     .select({
//       user: users,
//       shop: shopOwners,
//       service: services,
//       offer: offers,
//     })
//     .from(users)
//     .leftJoin(shopOwners, eq(shopOwners.userId, users.id))
//     .leftJoin(services, eq(services.shopId, shopOwners.id))
//     .leftJoin(offers, eq(offers.shopId, shopOwners.id))
//     .where(eq(shopOwners.id, id));

//   if (!rows.length) return null;

//   const { user, shop } = rows[0];

//   return {
//     user,
//     shop,
//     services: rows.map((r) => r.service).filter(Boolean),
//     offers: rows.map((r) => r.offer).filter(Boolean),
//   };
// };

export const getShopByIdDB = async (id) => {
  const rows = await db
    .select({
      user: users,
      shop: shopOwners,
      service: services,
      category: category,
      offer: offers,
    })
    .from(users)
    .leftJoin(shopOwners, eq(shopOwners.userId, users.id))
    .leftJoin(services, eq(services.shopId, shopOwners.id))
    .leftJoin(category, eq(category.id, services.categoryId))
    .leftJoin(offers, eq(offers.shopId, shopOwners.id))
    .where(eq(shopOwners.id, id));

  if (!rows.length) return null;

  const { user, shop } = rows[0];

  return {
    user,
    shop,
    services: rows
      .map((r) =>
        r.service
          ? {
              ...r.service,
              category: r.category,
            }
          : null
      )
      .filter(Boolean),
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

export const updateUserByIdDB = async (id, data) => {
  console.log("ID-------------", id);
  const updatedUser = await db
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();

  console.log("updatedUser[0];--------------", updatedUser[0]);

  return updatedUser[0];
};

export const getCustomerAppointmentsDB = async (customerId) => {
  return await db
    .select({
      appointment: appointments,

      expert: {
        id: experts.id,
        name: experts.name,
        image: experts.image,
        specialist: experts.specialist,
        about: experts.about,
      },

      shop: {
        id: shopOwners.id,
        parlourName: shopOwners.parlourName,
        address: shopOwners.address,
        shopImage: shopOwners.shopImage,
        totalRating: shopOwners.totalRating,
      },

      slot: slots,

      status: appointmentStatus,
    })
    .from(appointments)

    .leftJoin(experts, eq(appointments.expertId, experts.id))

    .leftJoin(shopOwners, eq(appointments.shopId, shopOwners.id))

    .leftJoin(slots, eq(appointments.slotId, slots.id))

    .leftJoin(
      appointmentStatus,
      eq(appointments.statusId, appointmentStatus.id)
    )

    .where(eq(appointments.customerId, customerId))

    .orderBy(desc(appointments.createdAt));
};
