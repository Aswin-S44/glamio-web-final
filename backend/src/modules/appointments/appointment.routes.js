import { Router } from "express";
import {
  approveAppointment,
  getAppointmentDetailsById,
  getAppointmetns,
  getCustomerAppointments,
} from "./appointment.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/my", authMiddleware, getCustomerAppointments);
router.get("/", authMiddleware, getAppointmetns);
router.get("/:id", authMiddleware, getAppointmentDetailsById);
router.patch("/:id/approve", authMiddleware, approveAppointment);

export default router;
 