import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
  createBooking,
  getAllShops,
  getAllShopsServices,
  getCustomerAppointments,
  getExpertDetails,
  getExpertsByShopId,
  getOrderSummary,
  getServiceDetailsById,
  getShopById,
  getShopReviewsAndImages,
  getSlotsByShopId,
  updateUserController,
} from "./customer.controller.js";
import {
  markNotificationAsRead,
  deleteNotification,
} from "../notifications/notifications.controller.js";

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

router.get("/appointments", authMiddleware, getCustomerAppointments);
router.patch("/profile", authMiddleware, updateUserController);

router.get("/expert/:id", getExpertDetails);

router.patch("/notifications/:id/read", authMiddleware, markNotificationAsRead);
router.delete("/notifications/:id", authMiddleware, deleteNotification);

export default router;
