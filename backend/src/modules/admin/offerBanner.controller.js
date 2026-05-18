import { uploadImageToCloudinary } from "../../utils/utils.js";
import * as offerBannerRepository from "./offerBanner.repository.js";

export const getAllOfferBanners = async (req, res) => {
  try {
    const offers = await offerBannerRepository.getAllOfferBanners();
    res.status(200).json({ offers });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch offer banners", error: error.message });
  }
};

export const createOfferBanner = async (req, res) => {
  try {
    const { title, offer, fromDate, toDate, buttonText, image, shopOwnerId } =
      req.body;
    if (
      !title ||
      !offer ||
      !fromDate ||
      !toDate ||
      !buttonText ||
      !shopOwnerId
    ) {
      return res.status(400).json({
        message:
          "title, offer, fromDate, toDate, buttonText and shopOwnerId are required",
      });
    }
    const imageUrl = await uploadImageToCloudinary(image);
    console.log("--------------", {
      title,
      offer,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      buttonText,
      image: imageUrl,
      shopOwnerId: Number(shopOwnerId),
    });
    const offerBanner = await offerBannerRepository.createOfferBanner({
      title,
      offer,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      buttonText,
      image: imageUrl,
      shopOwnerId: Number(shopOwnerId),
    });
    res
      .status(201)
      .json({ message: "Offer banner created successfully", offerBanner });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create offer banner", error: error.message });
  }
};

export const updateOfferBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, offer, fromDate, toDate, buttonText, image, shopOwnerId } =
      req.body;
    const existing = await offerBannerRepository.getOfferBannerById(Number(id));
    if (!existing)
      return res.status(404).json({ message: "Offer banner not found" });
    let imageUrl = existing.image;
    if (image && image.startsWith("data:")) {
      imageUrl = await uploadImageToCloudinary(image);
    }
    const offerBanner = await offerBannerRepository.updateOfferBanner(
      Number(id),
      {
        title,
        offer,
        fromDate: fromDate ? new Date(fromDate) : undefined,
        toDate: toDate ? new Date(toDate) : undefined,
        buttonText,
        image: imageUrl,
        shopOwnerId: shopOwnerId ? Number(shopOwnerId) : undefined,
      }
    );
    res
      .status(200)
      .json({ message: "Offer banner updated successfully", offerBanner });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update offer banner", error: error.message });
  }
};

export const deleteOfferBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await offerBannerRepository.getOfferBannerById(Number(id));
    if (!existing)
      return res.status(404).json({ message: "Offer banner not found" });
    await offerBannerRepository.deleteOfferBanner(Number(id));
    res.status(200).json({ message: "Offer banner deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete offer banner", error: error.message });
  }
};
