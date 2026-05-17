import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
  getNotifications,
  markNotificationAsRead,
  sendNotification,
} from "./notifications.controller.js";

const router = express.Router();

router.post("/", authMiddleware, sendNotification);
router.get("/", authMiddleware, getNotifications);

router.patch("/:id/read", authMiddleware, markNotificationAsRead);

export default router;
