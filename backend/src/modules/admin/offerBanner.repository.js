import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { offerBanner } from "../../db/schemas/offer_banner.js";

export const getAllOfferBanners = async () => {
  return await db.select().from(offerBanner).orderBy(offerBanner.createdAt);
};

export const getOfferBannerById = async (id) => {
  const result = await db
    .select()
    .from(offerBanner)
    .where(eq(offerBanner.id, id));
  return result[0] || null;
};

export const createOfferBanner = async ({
  title,
  offer,
  fromDate,
  toDate,
  buttonText,
  image,
  shopOwnerId,
}) => {
  const result = await db
    .insert(offerBanner)
    .values({
      title,
      offer,
      fromDate,
      toDate,
      buttonText,
      image,
      shopOwnerId,
    })
    .returning();
  return result[0];
};

export const updateOfferBanner = async (
  id,
  { title, offer, fromDate, toDate, buttonText, image }
) => {
  const result = await db
    .update(offerBanner)
    .set({
      ...(title && { title }),
      ...(offer && { offer }),
      ...(fromDate && { fromDate }),
      ...(toDate && { toDate }),
      ...(buttonText && { buttonText }),
      image,
      updatedAt: new Date(),
    })
    .where(eq(offerBanner.id, id))
    .returning();
  return result[0];
};

export const deleteOfferBanner = async (id) => {
  await db.delete(offerBanner).where(eq(offerBanner.id, id));
};
