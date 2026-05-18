import {
  approveAppointmentLogic,
  getAppointmentById,
  getAppointmentService,
} from "./appointment.service.js";
import { getShopIdByUserId } from "../slots/slot.service.js";

export const getAppointmetns = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const shopId = await getShopIdByUserId(userId);
  if (!shopId) return res.status(404).json({ message: "Shop not found" });

  const appointments = await getAppointmentService(shopId);
  res.json({ appointments });
};

export const getAppointmentDetailsById = async (req, res) => {
  const { id } = req.params;

  const appointment = await getAppointmentById(Number(id));
  if (!appointment)
    return res.status(404).json({ message: "Appointment not found" });

  res.json({ appointment });
};

export const approveAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await approveAppointmentLogic(Number(id), userId);

    return res.status(200).json(result);
  } catch (error) {
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Appointment not found" });
    }
    if (error.message === "UNAUTHORIZED") {
      return res.status(403).json({
        message: "You do not have permission to approve this appointment",
      });
    }
    return res.status(500).json({ message: "Error approving appointment" });
  }
};
