import { cloudinary } from "../config/cloudinary.js";

export const uploadImage = async (image) => {
  try {
    const response = await cloudinary.uploader.upload(image, {
      upload_preset: "cloudinary_react",
      public_id: `${Date.now()}_additional`,
    });

    return response?.secure_url ?? null;
  } catch (error) {
    return null;
  }
};
