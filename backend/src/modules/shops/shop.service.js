import { eq } from "drizzle-orm";
import { DEFAULT_NO_IMAGE } from "../../constants/constants.js";
import { db } from "../../db/index.js";
import { shopOwners } from "../../db/schemas/shop-owners.js";
import {
  getLatLngFromAddress,
  uploadImageToCloudinary,
  uploadMultipleImagesToCloudinary,
} from "../../utils/utils.js";
import {
  findShopByUserId,
  getShopStatsRepo,
  updateShopDB,
} from "./shop.repository.js";
import { users } from "../../db/schemas/users.js";

export const updateShopProfile = async (id, data) => {
  const result = await findShopByUserId(id);

  const shop = result?.shop;
  const user = result?.user;

  if (!user) {
    throw new Error("User not found!");
  }

  let parlourName = data?.shop?.parlourName ?? shop?.parlourName;
  let locationUrl = data?.shop?.googleReviewUrl ?? shop?.googleReviewUrl;

  const { coordinates, placeId, totalRating } = await getLatLngFromAddress(
    parlourName,
    locationUrl
  );

  const newShop = data?.shop;

  if (shop) {
    let updatedShopData = { ...newShop, placeId };

    if (newShop?.shopImage && newShop.shopImage.startsWith("data:")) {
      const uploadedUrl = await uploadImageToCloudinary(newShop.shopImage);
      if (uploadedUrl) {
        updatedShopData.shopImage = uploadedUrl;
      }
    }

    if (newShop?.galleryImages && newShop.galleryImages.length > 0) {
      const hasBase64 = newShop.galleryImages.some(
        (img) => img && img.startsWith("data:")
      );
      if (hasBase64) {
        const uploadedUrls = await uploadMultipleImagesToCloudinary(
          newShop.galleryImages
        );
        if (uploadedUrls.length > 0) {
          const existingUrls = newShop.galleryImages.filter(
            (img) => img && !img.startsWith("data:")
          );
          updatedShopData.galleryImages = [...existingUrls, ...uploadedUrls];
        }
      }
    }

    if (Object.keys(updatedShopData).length > 0) {
      await db
        .update(shopOwners)
        .set(updatedShopData)
        .where(eq(shopOwners.id, shop?.id));
    }

    if (data?.users?.phone) {
      await db
        .update(users)
        .set({ phone: data?.users?.phone })
        .where(eq(users.id, id));
    }
  } else {
    let shopImageUrl = DEFAULT_NO_IMAGE;
    let galleryImageUrls = [];

    if (newShop?.shopImage && newShop.shopImage.startsWith("data:")) {
      const uploadedUrl = await uploadImageToCloudinary(newShop.shopImage);
      if (uploadedUrl) {
        shopImageUrl = uploadedUrl;
      }
    } else if (newShop?.shopImage && !newShop.shopImage.startsWith("data:")) {
      shopImageUrl = newShop.shopImage;
    }

    if (newShop?.galleryImages && newShop.galleryImages.length > 0) {
      const hasBase64 = newShop.galleryImages.some(
        (img) => img && img.startsWith("data:")
      );
      if (hasBase64) {
        const uploadedUrls = await uploadMultipleImagesToCloudinary(
          newShop.galleryImages
        );
        galleryImageUrls = uploadedUrls;
      } else {
        galleryImageUrls = newShop.galleryImages;
      }
    }

    const shopData = {
      userId: user?.id,
      about: newShop?.about ?? "",
      address: newShop?.address ?? "",
      latitude: coordinates?.latitude,
      longitude: coordinates?.longitude,
      googleReviewUrl: newShop?.googleReviewUrl,
      isOnboarded: false,
      openingHours: newShop?.openingHours ?? {},
      parlourName: newShop?.parlourName,
      placeId,
      totalRating,
      isProfileCompleted: true,
      shopImage: shopImageUrl,
      galleryImages: galleryImageUrls,
    };

    await db.insert(shopOwners).values(shopData);
  }
};

export const getShopDashboardStats = async (shopId, timeframe) => {
  const stats = await getShopStatsRepo(shopId, timeframe);

  return {
    ...stats,
    revenueGrowth: timeframe === "monthly" ? "+22.4%" : "+12.5%",
    appointmentGrowth: timeframe === "monthly" ? "+15.2%" : "+5.2%",
    clientGrowth:
      timeframe === "monthly" ? "+45 new this month" : "+18 new today",
  };
};
