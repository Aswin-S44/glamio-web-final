import { getShopIdByUserId } from "../slots/slot.service.js";
import { OfferService } from "./offer.service.js";

export class OfferController {
  static async addOffer(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const shopId = await getShopIdByUserId(userId);
      if (!shopId) return res.status(404).json({ message: "Shop not found" });

      await OfferService.createOffer(shopId, req.body);
      return res.status(201).json({ message: "Offer created successfully" });
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async getOffers(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const shopId = await getShopIdByUserId(userId);
      if (!shopId) return res.status(404).json({ message: "Shop not found" });

      const page  = Number(req.query.page)  || 1;
      const limit = Number(req.query.limit) || 8;

      const result = await OfferService.getOffers(shopId, { page, limit });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch offers" });
    }
  }

  static async getOfferById(req, res) {
    try {
      const userId  = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const shopId  = await getShopIdByUserId(userId);
      if (!shopId) return res.status(404).json({ message: "Shop not found" });

      const offerId = Number(req.params.id);
      const offer   = await OfferService.getOfferById(shopId, offerId);
      return res.status(200).json(offer);
    } catch (error) {
      return res.status(404).json({
        message: error instanceof Error ? error.message : "Offer not found",
      });
    }
  }

  static async updateOfferById(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const shopId  = await getShopIdByUserId(userId);
      if (!shopId) return res.status(404).json({ message: "Shop not found" });

      const offerId = Number(req.params.id);
      await OfferService.updateOffer(shopId, offerId, req.body);
      return res.status(200).json({ message: "Offer updated successfully" });
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Update failed",
      });
    }
  }

  static async deleteOfferById(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const shopId  = await getShopIdByUserId(userId);
      if (!shopId) return res.status(404).json({ message: "Shop not found" });

      const offerId = Number(req.params.id);
      await OfferService.deleteOffer(shopId, offerId);
      return res.status(200).json({ message: "Offer deleted successfully" });
    } catch (error) {
      return res.status(404).json({
        message: error instanceof Error ? error.message : "Delete failed",
      });
    }
  }
}
