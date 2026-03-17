import { eq, and } from "drizzle-orm";

import { experts } from "../../db/schemas/experts.js";
import { db } from "../../db/index.js";

export const createExpertDB = async (data) => {
  try {
    return await db.insert(experts).values(data);
  } catch (error) {
    console.error("DATABASE ERROR:", error.message);
    throw error;
  }
};
export const getExpertsByShopId = (shopId) => {
  return db.select().from(experts).where(eq(experts.shopId, shopId));
};

export const getExpertByIdDB = (id, shopId) => {
  return db
    .select()
    .from(experts)
    .where(and(eq(experts.id, id), eq(experts.shopId, shopId)))
    .limit(1);
};

export const updateExpertDB = (id, data) => {
  return db.update(experts).set(data).where(eq(experts.id, id));
};

export const deleteExpertDB = (id, shopId) => {
  return db
    .delete(experts)
    .where(and(eq(experts.id, id), eq(experts.shopId, shopId)));
};
