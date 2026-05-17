import {
  BookingService,
  createBookingService,
  fetchExpertById,
  getAllExpertsByShopIdService,
  getAllServices,
  getAllShopsService,
  getBookingContextService,
  getCustomerAppointmentsService,
  normalizeServiceIds,
  getServiceDetailsByIdService,
  getShopByIdService,
  getSHopReviewsAndImageServices,
  updateUserService,
} from "./customer.service.js";
import { SlotService } from "../slots/slot.service.js";
import { services } from "../../db/schemas/services.js";
import { experts } from "../../db/schemas/experts.js";
import { slots } from "../../db/schemas/slots.js";
import { shopOwners } from "../../db/schemas/shop-owners.js";
import { db } from "../../db/index.js";
import { appointmentStatuses } from "../../constants/constants.js";
import { updateUserSchema } from "./customer.validation.js";
import { notifications } from "../../db/schemas/notifications.js";
import { deleteNotificationService } from "../notifications/notifications.service.js";

export const getAllShops = async (req, res) => {
  const shops = await getAllShopsService();
  res.json({ shops });
};

export const getShopById = async (req, res) => {
  try {
    const shop = await getShopByIdService(Number(req.params.id));
    res.json(shop);
  } catch (e) {
    res.status(404).json({ message: e.message });
  }
};

export const getExpertsByShopId = async (req, res) => {
  try {
    const rawServiceIds = req.query.serviceIds ?? req.query.serviceId;
    const serviceIds =
      typeof rawServiceIds === "string" && rawServiceIds.length
        ? rawServiceIds.split(",")
        : Array.isArray(rawServiceIds)
        ? rawServiceIds
        : [];

    const experts = await getAllExpertsByShopIdService(
      Number(req.params.shopId),
      serviceIds
    );
    res.json({ experts });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getSlotsByShopId = async (req, res) => {
  try {
    const shopIdParam = req.params.shopId;

    if (!shopIdParam || Array.isArray(shopIdParam)) {
      res.status(400).json({ message: "Invalid shopId" });
      return;
    }

    const shopId = Number(shopIdParam);

    if (isNaN(shopId)) {
      res.status(400).json({ message: "shopId must be a number" });
      return;
    }

    const slots = await SlotService.getSlots(shopId);

    res.status(200).json({ slots });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createBooking = async (req, res) => {
  try {
    console.log("*****************88", req.body);
    const shopId = Number(req.body.shopId);
    const slotId = Number(req.body.slotId);
    const expertId = Number(req.body.expertId);
    const customerId = Number(req.user?.id);
    const selectedServices = BookingService.normalizeServiceIds(
      req.body.serviceIds
    );
    const bookingContext = await getBookingContextService({
      shopId,
      slotId,
      expertId,
      serviceIds: selectedServices,
    });

    const dataToUpdate = {
      statusId: 1,
      customerId,
      expertId,
      slotId,
      shopId,
      serviceIds: bookingContext.serviceIds,
      rate: bookingContext.totalRate,
    };

    console.log("dataToUpdate----------------", dataToUpdate);

    // const existingBooking = await findExistingBookingService(dataToUpdate);

    // if (existingBooking) {
    //   res.status(400).json({
    //     message: "booking already exists with this shop , and statusId 1",
    //   });
    //   return;
    // }

    const result = await createBookingService(dataToUpdate);
    console.log("result------------------", result ? result : "no result");
    res.status(201).send({ appointment: result });
  } catch (error) {
    console.log("RRR0R-----------------", error);
    res.status(400).json({
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getShopReviewsAndImages = async (req, res) => {
  try {
    const { placeId } = req.params;

    if (!placeId || Array.isArray(placeId)) {
      res.status(400).json({ message: "Invalid placeId" });
      return;
    }

    const result = await getSHopReviewsAndImageServices(placeId);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getAllShopsServices = async (req, res) => {
  try {
    let limit = 1;
    let offset = 10;
    const result = await getAllServices(limit, offset);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getOrderSummary = async (req, res) => {
  try {
    const { shopId, slotId, expertId } = req.params;
    const rawServiceId = req.query.serviceId ?? req.query.serviceIds;

    if (
      rawServiceId === undefined ||
      (typeof rawServiceId === "object" && !Array.isArray(rawServiceId))
    ) {
      res.status(400).json({ message: "serviceId is required" });
      return;
    }

    const serviceIds = normalizeServiceIds(
      Array.isArray(rawServiceId) ? rawServiceId : rawServiceId.split(",")
    );

    if (!serviceIds.length) {
      res.status(400).json({ message: "Invalid serviceId" });
      return;
    }

    const bookingContext = await getBookingContextService({
      shopId: Number(shopId),
      slotId: Number(slotId),
      expertId: Number(expertId),
      serviceIds,
    });

    res.status(200).json({
      shop: bookingContext.shop,
      slot: bookingContext.slot,
      expert: bookingContext.expert,
      services: bookingContext.services,
      totalRate: bookingContext.totalRate,
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getServiceDetailsById = async (req, res) => {
  try {
    const services = await getServiceDetailsByIdService(Number(req.params.id));
    res.json(services);
  } catch (e) {
    res.status(404).json({ message: e.message });
  }
};

export const updateUserController = async (req, res) => {
  try {
    const userId = Number(req.user?.id);

    const validatedData = updateUserSchema.parse(req.body);

    const updatedUser = await updateUserService(userId, validatedData);

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCustomerAppointments = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const appointments = await getCustomerAppointmentsService(userId);

    return res.json({
      message: "Appointments fetched successfully",
      data: appointments,
    });
  } catch (e) {
    return res.status(400).json({
      message: e.message,
    });
  }
};

export const getExpertDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const expertId = parseInt(id);

    if (isNaN(expertId)) {
      return res.status(400).json({ message: "Invalid expert ID" });
    }

    const data = await fetchExpertById(expertId);

    if (!data) {
      return res.status(404).json({ message: "Expert not found" });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });

  }}

export const getCustomerNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const list = await db
      .select()
      .from(notifications)
      .where(eq(notifications.toId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
    res.json({ notifications: list });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const id = Number(req.params.id);
    await deleteNotificationService(id, userId);
    res.json({ success: true, message: "Notification deleted" });
  } catch (e) {
    if (e.message === "Unauthorized") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (e.message === "Notification not found") {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(500).json({ message: e.message });
  }
};