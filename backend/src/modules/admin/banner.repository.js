import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { banners } from "../../db/schemas/banners.js";

export const getAllBanners = async () => {
  return await db.select().from(banners).orderBy(banners.createdAt);
};

export const getBannerById = async (id) => {
  const result = await db.select().from(banners).where(eq(banners.id, id));
  return result[0] || null;
};

export const createBanner = async ({ title, offerDescription, image }) => {
  const result = await db
    .insert(banners)
    .values({
      title,
      offerDescription,
      image,
    })
    .returning();
  return result[0];
};

export const updateBanner = async (id, { title, offerDescription, image }) => {
  const result = await db
    .update(banners)
    .set({
      ...(title && { title }),
      ...(offerDescription && { offerDescription }),
      image,
      updatedAt: new Date(),
    })
    .where(eq(banners.id, id))
    .returning();
  return result[0];
};

export const deleteBanner = async (id) => {
  await db.delete(banners).where(eq(banners.id, id));
};
