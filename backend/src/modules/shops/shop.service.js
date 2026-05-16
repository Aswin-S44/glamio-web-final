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

export const updateShopProfile = async (id, data) => {
  const result = await findShopByUserId(id);

  const shop = result?.shop;
  const user = result?.user;

  if (!user) {
    throw new Error("User not found!");
  }

  let parlourName = shop?.parlourName;
  let locationUrl = shop?.googleReviewUrl;

  if (!shop) {
    parlourName = data?.shop?.parlourName;
    locationUrl = data?.shop?.parlourName;
  }

  const { coordinates, placeId, totalRating } = await getLatLngFromAddress(
    parlourName,
    locationUrl
  );

  console.log("CORDINATES--------------", coordinates);
  console.log("PLACE ID--------------", placeId);
  console.log("total rating-------------", totalRating);

  const newShop = data?.shop;

  if (shop) {
    // For updates, you might want to handle image updates differently
    // Only upload new images if they're base64 strings
    let updatedShopData = { ...newShop };

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
          // Merge existing non-base64 URLs with new uploaded ones
          const existingUrls = newShop.galleryImages.filter(
            (img) => img && !img.startsWith("data:")
          );
          updatedShopData.galleryImages = [...existingUrls, ...uploadedUrls];
        }
      }
    }

    await updateShopDB(id, updatedShopData);
  } else {
    // Upload images to Cloudinary before saving to database
    let shopImageUrl = DEFAULT_NO_IMAGE;
    let galleryImageUrls = [];

    // Upload shop image if it's base64
    if (newShop?.shopImage && newShop.shopImage.startsWith("data:")) {
      const uploadedUrl = await uploadImageToCloudinary(newShop.shopImage);
      if (uploadedUrl) {
        shopImageUrl = uploadedUrl;
      }
    } else if (newShop?.shopImage && !newShop.shopImage.startsWith("data:")) {
      // If it's already a URL, use it directly
      shopImageUrl = newShop.shopImage;
    }

    // Upload gallery images if they're base64
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
        // If they're already URLs, use them directly
        galleryImageUrls = newShop.galleryImages;
      }
    }

    let shopData = {
      userId: user?.id,
      about: newShop?.about ?? "",
      address: newShop?.address ?? "",
      latitude: coordinates?.latitude,
      longitude: coordinates?.longitude,
      googleReviewUrl: newShop?.googleReviewUrl,
      isOnboarded: false,
      openingHours: newShop?.openingHours ?? {}, // Or [] based on your schema
      parlourName: newShop?.parlourName,
      placeId,
      totalRating,
      isProfileCompleted: true,
      shopImage: shopImageUrl,
      galleryImages: galleryImageUrls,
    };

    console.log("shopData-----------------", shopData);

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
