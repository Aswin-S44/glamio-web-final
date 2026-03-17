import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { OfferController } from "./offer.controller.js";

const router = Router();

router.post("/", authMiddleware, OfferController.addOffer);
router.get("/", authMiddleware, OfferController.getOffers);
router.get("/:id", authMiddleware, OfferController.getOfferById);
router.patch("/:id", authMiddleware, OfferController.updateOfferById);
router.delete("/:id", authMiddleware, OfferController.deleteOfferById);

export default router;
