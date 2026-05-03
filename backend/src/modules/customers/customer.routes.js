import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
  createBooking,
  getAllShops,
  getAllShopsServices,
  getExpertsByShopId,
  getOrderSummary,
  getServiceDetailsById,
  getShopById,
  getShopReviewsAndImages,
  getSlotsByShopId,
  getCustomerNotifications,
  markNotificationRead,
} from "./customer.controller.js";

const router = Router();

router.get("/shops", getAllShops);
router.get("/shop/:id", getShopById);
router.get("/experts/:shopId", getExpertsByShopId);
router.get("/slots/:shopId", getSlotsByShopId);
router.post("/booking", authMiddleware, createBooking);
router.get("/reviews/:placeId", getShopReviewsAndImages);
router.get("/services", getAllShopsServices);
router.get("/order/summary/:shopId/:slotId/:expertId", getOrderSummary);
router.get("/service/:id", getServiceDetailsById);
router.get("/notifications", authMiddleware, getCustomerNotifications);
router.patch("/notifications/:id/read", authMiddleware, markNotificationRead);

export default router;
