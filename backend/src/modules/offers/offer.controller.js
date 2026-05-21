import { getShopIdByUserId } from "../slots/slot.service.js";
import { OfferService } from "./offer.service.js";

const resolveShopId = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }
  const shopId = await getShopIdByUserId(userId);
  if (!shopId) {
    res.status(404).json({ message: "Shop not found" });
    return null;
  }
  return shopId;
};

export class OfferController {
  static async addOffer(req, res) {
    try {
      const shopId = await resolveShopId(req, res);
      if (!shopId) return;

      await OfferService.createOffer(shopId, req.body);
      res.status(201).json({ message: "Offer created successfully" });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async getOffers(req, res) {
    try {
      const shopId = await resolveShopId(req, res);
      if (!shopId) return;

      const offers = await OfferService.getOffers(shopId);
      res.status(200).json({ offers });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch offers" });
    }
  }

  static async getOfferById(req, res) {
    try {
      const shopId = await resolveShopId(req, res);
      if (!shopId) return;

      const offerId = Number(req.params.id);
      const offer = await OfferService.getOfferById(shopId, offerId);
      res.status(200).json(offer);
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error ? error.message : "Offer not found",
      });
    }
  }

  static async updateOfferById(req, res) {
    try {
      const shopId = await resolveShopId(req, res);
      if (!shopId) return;

      const offerId = Number(req.params.id);
      await OfferService.updateOffer(shopId, offerId, req.body);
      res.status(200).json({ message: "Offer updated successfully" });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Update failed",
      });
    }
  }

  static async deleteOfferById(req, res) {
    try {
      const shopId = await resolveShopId(req, res);
      if (!shopId) return;

      const offerId = Number(req.params.id);
      await OfferService.deleteOffer(shopId, offerId);
      res.status(200).json({ message: "Offer deleted successfully" });
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error ? error.message : "Delete failed",
      });
    }
  }
}
