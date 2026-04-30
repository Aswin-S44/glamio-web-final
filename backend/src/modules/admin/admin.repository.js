import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schemas/users.js";
import { shopOwners } from "../../db/schemas/shop-owners.js";

export const getAllShopsRepo = async () => {
  const result = await db
    .select({
      shopId:             shopOwners.id,
      parlourName:        shopOwners.parlourName,
      about:              shopOwners.about,
      address:            shopOwners.address,
      shopImage:          shopOwners.shopImage,
      galleryImages:      shopOwners.galleryImages,
      isProfileCompleted: shopOwners.isProfileCompleted,
      isOnboarded:        shopOwners.isOnboarded,
      googleReviewUrl:    shopOwners.googleReviewUrl,
      ownerName:          users.username,
      ownerEmail:         users.email,
      phone:              users.phone,
      profileImage:       users.profileImage,
    })
    .from(shopOwners)
    .leftJoin(users, eq(shopOwners.userId, users.id))
    .orderBy(shopOwners.id);

  return result.map(r => ({ ...r, id: r.shopId }));
};

export const approveShopRepo = async (shopId) => {
  await db
    .update(shopOwners)
    .set({ isOnboarded: true })
    .where(eq(shopOwners.id, Number(shopId)));
};

export const rejectShopRepo = async (shopId) => {
  await db
    .update(shopOwners)
    .set({ isOnboarded: false, isProfileCompleted: false })
    .where(eq(shopOwners.id, Number(shopId)));
};
