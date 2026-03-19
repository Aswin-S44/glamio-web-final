import { and, count, eq, like } from "drizzle-orm";
import {
  createCategory,
  createServiceDB,
  deleteServiceDB,
  findCategoryByName,
  findServiceByIdAndShop,
  getServiceByIdDB,
  updateServiceDB,
} from "./service.repository.js";
import { uploadImage } from "../../utils/upload.js";
import { services } from "../../db/schemas/services.js";
import { category } from "../../db/schemas/category.js";
import { db } from "../../db/index.js";
 
export const createServiceService = async (shopId, payload) => {
  const { name, imageUrl, rate, category, description, duration } = payload;

  let categoryId;

  const existingCategory = await findCategoryByName(category);
  if (existingCategory) {
    categoryId = Number(existingCategory.id);
  } else {
    categoryId = await createCategory(category);
  }

  const uploadedImage = await uploadImage(imageUrl);
  if (!uploadedImage) {
    throw new Error("Image upload failed");
  }

  await createServiceDB({
    name,
    imageUrl: uploadedImage,
    rate,
    shopId,
    categoryId,
    description,
    duration,
  });
};

export const getServicesService = (
  shopId,
  limit,
  offset,
  search,
  categoryName
) => {
  const conditions = [eq(services.shopId, shopId)];

  if (search) {
    conditions.push(like(services.name, `%${search}%`));
  }

  if (categoryName !== "All") {
    conditions.push(eq(category.name, categoryName));
  }

  return db
    .select({
      id: services.id,
      name: services.name,
      imageUrl: services.imageUrl,
      rate: services.rate,
      shopId: services.shopId,
      categoryId: services.categoryId,
      categoryName: category.name,
      createdAt: services.createdAt,
      updatedAt: services.updatedAt,
      description: services.description,
      duration: services.duration,
    })
    .from(services)
    .leftJoin(category, eq(services.categoryId, category.id))
    .where(and(...conditions))
    .limit(limit)
    .offset(offset);
};

export const getServicesCountService = (shopId, search, categoryName) => {
  const conditions = [eq(services.shopId, shopId)];

  if (search) {
    conditions.push(like(services.name, `%${search}%`));
  }

  if (categoryName !== "All") {
    conditions.push(eq(category.name, categoryName));
  }

  return db
    .select({ count: count() })
    .from(services)
    .leftJoin(category, eq(services.categoryId, category.id))
    .where(and(...conditions));
};

export const getServiceByIdService = async (id, shopId) => {
  const result = await getServiceByIdDB(id, shopId);
  if (!result.length) throw new Error("Service not found");
  return result[0];
};

export const updateServiceService = async (id, shopId, data) => {
  const exists = await findServiceByIdAndShop(id, shopId);
  if (!exists.length) throw new Error("Service not found");

  await updateServiceDB(id, data);
};

export const deleteServiceService = async (id, shopId) => {
  const exists = await findServiceByIdAndShop(id, shopId);
  if (!exists.length) throw new Error("Service not found");

  await deleteServiceDB(id, shopId);
};
