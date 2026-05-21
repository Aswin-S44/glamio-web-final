import { getShopIdByUserId } from "../slots/slot.service.js";
import {
  createServiceService,
  deleteServiceService,
  getServiceByIdService,
  getServicesCountService,
  getServicesService,
  updateServiceService,
} from "./service.service.js";

const resolveShopId = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }
  const shopId = await getShopIdByUserId(userId);
  if (!shopId) {
    res.status(404).json({ message: "Shop not found" });
    return null;
  }
  return shopId;
};

export const createService = async (req, res) => {
  try {
    const shopId = await resolveShopId(req, res);
    if (!shopId) return;

    await createServiceService(shopId, req.body);
    res.status(201).json({ message: "Service created successfully" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const getServices = async (req, res) => {
  try {
    const shopId = await resolveShopId(req, res);
    if (!shopId) return;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const search = req.query.search || "";
    const categoryName = req.query.category || "All";
    const offset = (page - 1) * limit;

    const [services, totalCountResult] = await Promise.all([
      getServicesService(shopId, limit, offset, search, categoryName),
      getServicesCountService(shopId, search, categoryName),
    ]);

    const totalCount = totalCountResult[0].count;

    res.json({
      services,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const shopId = await resolveShopId(req, res);
    if (!shopId) return;

    const service = await getServiceByIdService(Number(req.params.id), shopId);
    res.json(service);
  } catch (e) {
    res.status(404).json({ message: e.message });
  }
};

export const updateServiceById = async (req, res) => {
  try {
    const shopId = await resolveShopId(req, res);
    if (!shopId) return;

    await updateServiceService(Number(req.params.id), shopId, req.body);
    res.json({ message: "Service updated successfully" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const deleteServiceById = async (req, res) => {
  try {
    const shopId = await resolveShopId(req, res);
    if (!shopId) return;

    await deleteServiceService(Number(req.params.id), shopId);
    res.json({ message: "Service deleted successfully" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
