import axios from "axios";

import { eq } from "drizzle-orm";
import {
  createBookingDB,
  findBookingDB,
  getAllExpertsByShopIdDB,
  getAllShopsDB,
} from "./customer.repository.js";
import { services } from "../../db/schemas/services.js";
import { category } from "../../db/schemas/category.js";
import { db } from "../../db/index.js";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export const getAllShopsService = () => {
  return getAllShopsDB();
};

export const getShopByIdService = async (id) => {
  const shop = await getShopByIdDB(id);
  if (!shop) throw new Error("Shop not found");
  return shop;
};

export const getAllExpertsByShopIdService = (shopId) => {
  return getAllExpertsByShopIdDB(shopId);
};

export class BookingService {
  static async calculateTotalRate(serviceIds) {
    const serviceList = await getServicesByIds(serviceIds);

    if (serviceList.length !== serviceIds.length) {
      throw new Error("One or more services not found");
    }

    return serviceList.reduce((sum, service) => sum + service.rate, 0);
  }
}

export const createBookingService = (data) => {
  return createBookingDB(data);
};

export const findExistingBookingService = async (data) => {
  const result = await findBookingDB(data);
  return result[0] || null;
};

export const getSHopReviewsAndImageServices = async (placeId) => {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews,photos&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const res = await axios.get(url);
    const result = res?.data?.result;

    if (!result) {
      return { rating: 0, reviews: [], images: [] };
    }

    const photos = result.photos || [];

    const images = photos.map(
      (p) =>
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${p.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
    );

    return {
      rating: result.rating || 0,
      reviews: result.reviews || [],
      images,
    };
  } catch {
    return { rating: 0, reviews: [], images: [] };
  }
};

export const getAllServices = (limit, offset) => {
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
    .leftJoin(category, eq(services.categoryId, category.id));
  // .limit(limit)
  // .offset(offset);
};
