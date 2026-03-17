import { eq, and, inArray } from "drizzle-orm";

import { category } from "../../db/schemas/category.js";
import { services } from "../../db/schemas/services.js";
import { db } from "../../db/index.js";

export const findCategoryByName = async (name) => {
  const [result] = await db
    .select()
    .from(category)
    .where(eq(category.name, name))
    .limit(1);

  return result || null;
};

export const createCategory = async (name) => {
  const [result] = await db.insert(category).values({ name }).$returningId();

  return Number(result.id);
};

export const createServiceDB = async (data) => {
  return db.insert(services).values(data);
};

export const getServicesByShopId = (shopId) => {
  return db.select().from(services).where(eq(services.shopId, shopId));
};

export const findServiceByIdAndShop = (id, shopId) => {
  return db
    .select({ id: services.id })
    .from(services)
    .where(and(eq(services.id, id), eq(services.shopId, shopId)));
};

export const updateServiceDB = (id, data) => {
  return db.update(services).set(data).where(eq(services.id, id));
};

export const deleteServiceDB = (id, shopId) => {
  return db
    .delete(services)
    .where(and(eq(services.id, id), eq(services.shopId, shopId)));
};

export const getServiceByIdDB = (id, shopId) => {
  return db
    .select()
    .from(services)
    .where(and(eq(services.id, id), eq(services.shopId, shopId)))
    .limit(1);
};

export const getServicesByIds = async (serviceIds) => {
  return db
    .select({
      id: services.id,
      rate: services.rate,
    })
    .from(services)
    .where(inArray(services.id, serviceIds));
};
