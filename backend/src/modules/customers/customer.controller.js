import { and, eq, inArray, sum } from "drizzle-orm";
import {
  BookingService,
  createBookingService,
  getAllExpertsByShopIdService,
  getAllServices,
  getAllShopsService,
  getServiceDetailsByIdService,
  getShopByIdService,
  getSHopReviewsAndImageServices,
} from "./customer.service.js";
import { SlotService } from "../slots/slot.service.js";
import { services } from "../../db/schemas/services.js";
import { experts } from "../../db/schemas/experts.js";
import { slots } from "../../db/schemas/slots.js";
import { shopOwners } from "../../db/schemas/shop-owners.js";
import { db } from "../../db/index.js";
import { appointmentStatuses } from "../../constants/constants.js";

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
  const experts = await getAllExpertsByShopIdService(Number(req.params.shopId));
  res.json({ experts });
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
    const shopId = Number(req.body.shopId);
    const slotId = Number(req.body.slotId);
    const expertId = Number(req.body.expertId);
    const customerId = Number(req.user?.id);
    const appointmentStatus = appointmentStatuses.PENDING;
    const selectedServices = req.body.serviceIds;
    const bookingRate = await BookingService.calculateTotalRate(
      selectedServices
    );

    const dataToUpdate = {
      statusId: 1,
      customerId,
      expertId,
      slotId,
      shopId,
      serviceIds: selectedServices,
      rate: bookingRate,
    };

    // const existingBooking = await findExistingBookingService(dataToUpdate);

    // if (existingBooking) {
    //   res.status(400).json({
    //     message: "booking already exists with this shop , and statusId 1",
    //   });
    //   return;
    // }

    const result = await createBookingService(dataToUpdate);
    res.status(201).send({ appointment: result });
  } catch (error) {
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
    let limit = 20;
    let offset = 0;
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
    const rawServiceId = req.query.serviceId;

    if (
      rawServiceId === undefined ||
      (typeof rawServiceId === "object" && !Array.isArray(rawServiceId))
    ) {
      res.status(400).json({ message: "serviceId is required" });
      return;
    }

    const serviceIds = (
      Array.isArray(rawServiceId) ? rawServiceId : rawServiceId.split(",")
    )
      .map(Number)
      .filter((id) => !isNaN(id));

    if (!serviceIds.length) {
      res.status(400).json({ message: "Invalid serviceId" });
      return;
    }

    const [shop] = await db
      .select()
      .from(shopOwners)
      .where(eq(shopOwners.id, Number(shopId)));

    const [slot] = await db
      .select()
      .from(slots)
      .where(
        and(eq(slots.id, Number(slotId)), eq(slots.shopId, Number(shopId)))
      );

    const [expert] = await db
      .select()
      .from(experts)
      .where(
        and(
          eq(experts.id, Number(expertId)),
          eq(experts.shopId, Number(shopId))
        )
      );

    const selectedServices = await db
      .select()
      .from(services)
      .where(
        and(
          eq(services.shopId, Number(shopId)),
          inArray(services.id, serviceIds)
        )
      );

    const [total] = await db
      .select({ totalRate: sum(services.rate) })
      .from(services)
      .where(inArray(services.id, serviceIds));

    res.status(200).json({
      shop,
      slot,
      expert,
      services: selectedServices,
      totalRate: Number(total?.totalRate ?? 0),
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
