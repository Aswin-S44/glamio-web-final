import { uploadImageToCloudinary } from "../../utils/utils.js";
import * as bannerRepository from "./banner.repository.js";

export const getAllBanners = async (req, res) => {
  try {
    const banners = await bannerRepository.getAllBanners();
    res.status(200).json({ banners });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch banners", error: error.message });
  }
};

export const createBanner = async (req, res) => {
  try {
    const { title, offerDescription, image } = req.body;
    if (!title || !offerDescription) {
      return res
        .status(400)
        .json({ message: "title and offerDescription are required" });
    }
    const imageUrl = await uploadImageToCloudinary(image);
    const banner = await bannerRepository.createBanner({
      title,
      offerDescription,
      image: imageUrl,
    });
    res.status(201).json({ message: "Banner created successfully", banner });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create banner", error: error.message });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, offerDescription, image } = req.body;
    const existing = await bannerRepository.getBannerById(Number(id));
    if (!existing) return res.status(404).json({ message: "Banner not found" });
    let imageUrl = existing.image;
    if (image && image.startsWith("data:")) {
      imageUrl = await uploadImageToCloudinary(image);
    }
    const banner = await bannerRepository.updateBanner(Number(id), {
      title,
      offerDescription,
      image: imageUrl,
    });
    res.status(200).json({ message: "Banner updated successfully", banner });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update banner", error: error.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await bannerRepository.getBannerById(Number(id));
    if (!existing) return res.status(404).json({ message: "Banner not found" });
    await bannerRepository.deleteBanner(Number(id));
    res.status(200).json({ message: "Banner deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete banner", error: error.message });
  }
};
