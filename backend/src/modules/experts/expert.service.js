import { uploadImage } from "../../utils/upload.js";
import {
  createExpertDB,
  deleteExpertDB,
  getExpertByIdDB,
  getExpertsByShopId,
  updateExpertDB,
} from "./expert.repository.js";

export const addExpertService = async (shopId, payload) => {
  const uploadedImage = await uploadImage(payload.image);

  if (!uploadedImage) {
    throw new Error("Image upload failed");
  }

  await createExpertDB({
    ...payload,
    image: uploadedImage,
    shopId,
  });
};

export const getExpertsService = (shopId) => {
  return getExpertsByShopId(shopId);
};

export const getExpertByIdService = async (id, shopId) => {
  const [expert] = await getExpertByIdDB(id, shopId);
  if (!expert) throw new Error("Expert not found");
  return expert;
};

export const updateExpertService = async (id, shopId, data) => {
  const [expert] = await getExpertByIdDB(id, shopId);
  if (!expert) throw new Error("Expert not found");

  await updateExpertDB(id, data);
};

export const deleteExpertService = async (id, shopId) => {
  const [expert] = await getExpertByIdDB(id, shopId);
  if (!expert) throw new Error("Expert not found");

  await deleteExpertDB(id, shopId);
};
