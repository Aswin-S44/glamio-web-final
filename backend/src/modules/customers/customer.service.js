import axios from "axios";
import dotenv from "dotenv";
import { eq } from "drizzle-orm";
import {
  createBookingDB,
  getExpertByIdAndShopIdDB,
  findBookingDB,
  getAllShopsDB,
  getCustomerAppointmentsDB,
  getShopOwnerByIdDB,
  getServiceDetailsByIdDB,
  getSlotByIdAndShopIdDB,
  getShopByIdDB,
  updateUserByIdDB,
} from "./customer.repository.js";
import { services } from "../../db/schemas/services.js";
import { category } from "../../db/schemas/category.js";
import { db } from "../../db/index.js";
import {
  getServicesByIds,
  getServicesByIdsAndShopId,
} from "../services/service.repository.js";
import {
  getExpertServiceMappingsByExpertIds,
  getExpertsByShopId,
} from "../experts/expert.repository.js";
import { experts } from "../../db/schemas/experts.js";
import { shopOwners } from "../../db/schemas/shop-owners.js";
dotenv.config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export const getAllShopsService = () => {
  return getAllShopsDB();
};

export const getShopByIdService = async (id) => {
  const shop = await getShopByIdDB(id);
  if (!shop) throw new Error("Shop not found");
  return shop;
};

export const normalizeServiceIds = (serviceIds = []) => {
  if (!Array.isArray(serviceIds)) {
    return [];
  }

  return [
    ...new Set(
      serviceIds
        .map(Number)
        .filter((id) => Number.isInteger(id) && id > 0)
    ),
  ];
};

const attachServiceIdsToExperts = async (expertsList) => {
  if (!expertsList.length) {
    return [];
  }

  const mappings = await getExpertServiceMappingsByExpertIds(
    expertsList.map((expert) => expert.id)
  );

  const serviceIdsByExpertId = mappings.reduce((acc, mapping) => {
    if (!acc[mapping.expertId]) {
      acc[mapping.expertId] = [];
    }

    acc[mapping.expertId].push(mapping.serviceId);
    return acc;
  }, {});

  return expertsList.map((expert) => ({
    ...expert,
    serviceIds: serviceIdsByExpertId[expert.id] ?? [],
  }));
};

export const getAllExpertsByShopIdService = async (shopId, serviceIds = []) => {
  const normalizedServiceIds = normalizeServiceIds(serviceIds);

  if (normalizedServiceIds.length) {
    const selectedServices = await getServicesByIdsAndShopId(
      normalizedServiceIds,
      shopId
    );

    if (selectedServices.length !== normalizedServiceIds.length) {
      throw new Error("One or more selected services are invalid for this shop");
    }
  }

  const expertsList = await getExpertsByShopId(shopId);
  const expertsWithServices = await attachServiceIdsToExperts(expertsList);

  const activeExperts = expertsWithServices.filter((expert) => expert.isActive);

  if (!normalizedServiceIds.length) {
    return activeExperts;
  }

  return activeExperts.filter((expert) =>
    normalizedServiceIds.every((serviceId) =>
      expert.serviceIds.includes(serviceId)
    )
  );
};

export class BookingService {
  static normalizeServiceIds(serviceIds) {
    return normalizeServiceIds(serviceIds);
  }

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
  } catch (error) {
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

export const getServiceDetailsByIdService = async (id) => {
  const result = await getServiceDetailsByIdDB(id);
  if (!result.length) throw new Error("Service not found");
  return result;
};

export const getBookingContextService = async ({
  shopId,
  slotId,
  expertId,
  serviceIds,
}) => {
  const normalizedServiceIds = normalizeServiceIds(serviceIds);

  if (!normalizedServiceIds.length) {
    throw new Error("At least one service must be selected");
  }

  const [shop, slot, expert, selectedServices] = await Promise.all([
    getShopOwnerByIdDB(shopId),
    getSlotByIdAndShopIdDB(slotId, shopId),
    getExpertByIdAndShopIdDB(expertId, shopId),
    getServicesByIdsAndShopId(normalizedServiceIds, shopId),
  ]);

  if (!shop) {
    throw new Error("Shop not found");
  }

  if (!slot) {
    throw new Error("Slot not found");
  }

  if (!expert) {
    throw new Error("Expert not found");
  }

  if (!expert.isActive) {
    throw new Error("Selected expert is not active");
  }

  if (selectedServices.length !== normalizedServiceIds.length) {
    throw new Error("One or more selected services are invalid for this shop");
  }

  const [expertWithServices] = await attachServiceIdsToExperts([expert]);

  const canPerformAllServices = normalizedServiceIds.every((serviceId) =>
    expertWithServices.serviceIds.includes(serviceId)
  );

  if (!canPerformAllServices) {
    throw new Error(
      "Selected expert is not assigned to all requested services"
    );
  }

  return {
    shop,
    slot,
    expert: expertWithServices,
    services: selectedServices,
    serviceIds: normalizedServiceIds,
    totalRate: selectedServices.reduce(
      (sum, service) => sum + Number(service.rate || 0),
      0
    ),
  };
};

export const updateUserService = async (id, data) => {
  const updatedUser = await updateUserByIdDB(id, data);

  if (!updatedUser) {
    throw new Error("User not found");
  }

  return updatedUser;
};

export const getCustomerAppointmentsService = async (customerId) => {
  return await getCustomerAppointmentsDB(customerId);
};

export const fetchExpertById = async (expertId) => {
  const result = await db
    .select({
      expert: {
        id: experts.id,
        name: experts.name,
        about: experts.about,
        address: experts.address,
        image: experts.image,
        specialist: experts.specialist,
        isActive: experts.isActive,
        createdAt: experts.createdAt,
      },
      shop: {
        id: shopOwners.id,
        parlourName: shopOwners.parlourName,
        address: shopOwners.address,
        about: shopOwners.about,
        latitude: shopOwners.latitude,
        longitude: shopOwners.longitude,
        shopImage: shopOwners.shopImage,
        totalRating: shopOwners.totalRating,
        openingHours: shopOwners.openingHours,
        placeId: shopOwners.placeId,
      },
    })
    .from(experts)
    .innerJoin(shopOwners, eq(experts.shopId, shopOwners.id))
    .where(eq(experts.id, expertId));

  return result[0] || null;
};
