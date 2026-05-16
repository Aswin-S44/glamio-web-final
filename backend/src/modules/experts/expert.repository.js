import { eq, and, inArray } from "drizzle-orm";

import { experts } from "../../db/schemas/experts.js";
import { expertServices } from "../../db/schemas/expert_services.js";
import { db } from "../../db/index.js";

export const createExpertDB = async (data, executor = db) => {
  try {
    return await executor.insert(experts).values(data).returning();
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

export const updateExpertDB = (id, data, executor = db) => {
  return executor.update(experts).set(data).where(eq(experts.id, id));
};

export const deleteExpertDB = (id, shopId, executor = db) => {
  return executor
    .delete(experts)
    .where(and(eq(experts.id, id), eq(experts.shopId, shopId)));
};

export const getExpertServiceMappingsByExpertIds = async (expertIds) => {
  if (!expertIds.length) {
    return [];
  }

  return db
    .select({
      expertId: expertServices.expertId,
      serviceId: expertServices.serviceId,
    })
    .from(expertServices)
    .where(inArray(expertServices.expertId, expertIds));
};

export const replaceExpertServiceMappings = async (
  executor,
  expertId,
  serviceIds
) => {
  await executor
    .delete(expertServices)
    .where(eq(expertServices.expertId, expertId));

  if (!serviceIds.length) {
    return;
  }

  await executor.insert(expertServices).values(
    serviceIds.map((serviceId) => ({
      expertId,
      serviceId,
    }))
  );
};

export const deleteExpertServiceMappings = async (executor, expertId) => {
  return executor
    .delete(expertServices)
    .where(eq(expertServices.expertId, expertId));
};
