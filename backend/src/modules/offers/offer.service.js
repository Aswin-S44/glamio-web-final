import { OfferRepository } from "./offer.repository.js";

export class OfferService {
  static async createOffer(shopId, data) {
    // Block duplicate offers for the same service (not category)
    const existing = await OfferRepository.findByService(shopId, data.serviceId);
    if (existing.length) {
      throw new Error("An offer already exists for this service");
    }

    return OfferRepository.create(shopId, data);
  }

  static async getOffers(shopId, { page, limit } = {}) {
    return OfferRepository.findAllByShop(shopId, { page, limit });
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
