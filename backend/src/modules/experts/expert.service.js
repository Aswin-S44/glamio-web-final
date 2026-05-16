import { uploadImage } from "../../utils/upload.js";
import {
  createExpertDB,
  deleteExpertServiceMappings,
  deleteExpertDB,
  getExpertByIdDB,
  getExpertServiceMappingsByExpertIds,
  getExpertsByShopId,
  replaceExpertServiceMappings,
  updateExpertDB,
} from "./expert.repository.js";
import { db } from "../../db/index.js";
import { getServicesByIdsAndShopId } from "../services/service.repository.js";

const normalizeServiceIds = (serviceIds = []) => {
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

const validateExpertServiceIds = async (shopId, serviceIds) => {
  if (!serviceIds.length) {
    return;
  }

  const shopServices = await getServicesByIdsAndShopId(serviceIds, shopId);

  if (shopServices.length !== serviceIds.length) {
    throw new Error("One or more selected services do not belong to this shop");
  }
};

export const addExpertService = async (shopId, payload) => {
  const { serviceIds: rawServiceIds, ...expertPayload } = payload;
  const serviceIds = normalizeServiceIds(rawServiceIds);
  await validateExpertServiceIds(shopId, serviceIds);

  const uploadedImage = await uploadImage(payload.image);

  if (!uploadedImage) {
    throw new Error("Image upload failed");
  }

  await db.transaction(async (tx) => {
    const [expert] = await createExpertDB(
      {
        ...expertPayload,
        image: uploadedImage,
        shopId,
      },
      tx
    );

    await replaceExpertServiceMappings(tx, expert.id, serviceIds);
  });
};

export const getExpertsService = async (shopId) => {
  const experts = await getExpertsByShopId(shopId);
  return attachServiceIdsToExperts(experts);
};

export const getExpertByIdService = async (id, shopId) => {
  const [expert] = await getExpertByIdDB(id, shopId);
  if (!expert) throw new Error("Expert not found");

  const [expertWithServices] = await attachServiceIdsToExperts([expert]);
  return expertWithServices;
};

export const updateExpertService = async (id, shopId, data) => {
  const [expert] = await getExpertByIdDB(id, shopId);
  if (!expert) throw new Error("Expert not found");

  const { serviceIds: rawServiceIds, ...expertData } = data;
  const serviceIds = normalizeServiceIds(rawServiceIds);
  await validateExpertServiceIds(shopId, serviceIds);

  await db.transaction(async (tx) => {
    await updateExpertDB(id, expertData, tx);

    if (Array.isArray(rawServiceIds)) {
      await replaceExpertServiceMappings(tx, id, serviceIds);
    }
  });
};

export const deleteExpertService = async (id, shopId) => {
  const [expert] = await getExpertByIdDB(id, shopId);
  if (!expert) throw new Error("Expert not found");

  await db.transaction(async (tx) => {
    await deleteExpertServiceMappings(tx, id);
    await deleteExpertDB(id, shopId, tx);
  });
};
