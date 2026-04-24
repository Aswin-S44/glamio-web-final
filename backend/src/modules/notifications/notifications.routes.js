import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { sendNotification } from "./notifications.controller.js";

const router = express.Router();

router.post("/", authMiddleware, sendNotification);

export default router;
