import { Router } from "express";
import {
  approveAppointment,
  getAppointmentDetailsById,
  getAppointmetns,
} from "./appointment.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getAppointmetns);
router.get("/:id", authMiddleware, getAppointmentDetailsById);
router.patch("/:id/approve", authMiddleware, approveAppointment);

export default router;
