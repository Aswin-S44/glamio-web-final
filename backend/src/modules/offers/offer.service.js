import { uploadImage } from "../../utils/upload.js";
import { OfferRepository } from "./offer.repository.js";

export class OfferService {
  static async createOffer(shopId, data) {
    const existing = await OfferRepository.findByCategory(
      shopId,
      data.categoryId
    );

    if (existing.length) {
      throw new Error("Offer already exists for this category");
    }

    const imageUrl = data.image ? await uploadImage(data.image) : null;

    return OfferRepository.create(shopId, {
      ...data,
      image: imageUrl ?? undefined,
    });
  }

  static getOffers(shopId) {
    return OfferRepository.findAllByShop(shopId);
  }

  static async getOfferById(shopId, offerId) {
    const [offer] = await OfferRepository.findById(shopId, offerId);
    if (!offer) throw new Error("Offer not found");
    return offer;
  }

  static async updateOffer(shopId, offerId, data) {
    await this.getOfferById(shopId, offerId);
    return OfferRepository.update(shopId, offerId, data);
  }

  static async deleteOffer(shopId, offerId) {
    await this.getOfferById(shopId, offerId);
    return OfferRepository.delete(shopId, offerId);
  }
}
