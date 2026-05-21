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
  if (!Array.isArray(serviceIds)) return [];
  return [
    ...new Set(serviceIds.map(Number).filter((id) => Number.isInteger(id) && id > 0)),
  ];
};

const attachServiceIdsToExperts = async (expertsList) => {
  if (!expertsList.length) return [];

  const mappings = await getExpertServiceMappingsByExpertIds(
    expertsList.map((e) => e.id)
  );

  const byExpert = mappings.reduce((acc, m) => {
    if (!acc[m.expertId]) acc[m.expertId] = [];
    acc[m.expertId].push(m.serviceId);
    return acc;
  }, {});

  return expertsList.map((expert) => ({
    ...expert,
    serviceIds: byExpert[expert.id] ?? [],
  }));
};

const validateExpertServiceIds = async (shopId, serviceIds) => {
  if (!serviceIds.length) return;
  const shopServices = await getServicesByIdsAndShopId(serviceIds, shopId);
  if (shopServices.length !== serviceIds.length) {
    throw new Error("One or more selected services do not belong to this shop");
  }
};

const maybeUploadImage = async (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("data:") || imageUrl.startsWith("http")) {
    const uploaded = await uploadImage(imageUrl);
    return uploaded || imageUrl;
  }
  return imageUrl;
};

export const addExpertService = async (shopId, payload) => {
  const { serviceIds: rawServiceIds, ...expertPayload } = payload;
  const serviceIds = normalizeServiceIds(rawServiceIds);
  await validateExpertServiceIds(shopId, serviceIds);

  const imageUrl = await maybeUploadImage(expertPayload.image);

  // Run sequentially without a transaction to avoid pgbouncer prepared-statement issues
  const [expert] = await createExpertDB({ ...expertPayload, image: imageUrl, shopId });
  await replaceExpertServiceMappings(db, expert.id, serviceIds);
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

  const imageUrl = await maybeUploadImage(expertData.image) ?? expert.image;

  await updateExpertDB(id, { ...expertData, image: imageUrl });
  if (Array.isArray(rawServiceIds)) {
    await replaceExpertServiceMappings(db, id, serviceIds);
  }
};

export const deleteExpertService = async (id, shopId) => {
  const [expert] = await getExpertByIdDB(id, shopId);
  if (!expert) throw new Error("Expert not found");

  await deleteExpertServiceMappings(db, id);
  await deleteExpertDB(id, shopId);
};
