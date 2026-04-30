import { getShopIdByUserId } from "../slots/slot.service.js";
import {
  createServiceService,
  deleteServiceService,
  getServiceByIdService,
  getServicesCountService,
  getServicesService,
  updateServiceService,
} from "./service.service.js";

export const createService = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const shopId = await getShopIdByUserId(userId);
    if (!shopId) return res.status(404).json({ message: "Shop not found" });

    await createServiceService(shopId, req.body);
    return res.status(201).json({ message: "Service created successfully" });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

export const getServices = async (req, res) => {
  const userId = req.user?.id;
  const page         = parseInt(req.query.page)     || 1;
  const limit        = parseInt(req.query.limit)    || 8;
  const search       = req.query.search             || "";
  const categoryName = req.query.category           || "All";

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const shopId = await getShopIdByUserId(userId);
  if (!shopId) return res.status(404).json({ message: "Shop not found" });

  const offset = (page - 1) * limit;

  const [services, totalCountResult] = await Promise.all([
    getServicesService(shopId, limit, offset, search, categoryName),
    getServicesCountService(shopId, search, categoryName),
  ]);

  const totalCount = totalCountResult[0].count;

  return res.json({
    services,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    },
  });
};

export const getServiceById = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const shopId = await getShopIdByUserId(userId);
    if (!shopId) return res.status(404).json({ message: "Shop not found" });

    const service = await getServiceByIdService(Number(req.params.id), shopId);
    return res.json(service);
  } catch (e) {
    return res.status(404).json({ message: e.message });
  }
};

export const updateServiceById = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const shopId = await getShopIdByUserId(userId);
    if (!shopId) return res.status(404).json({ message: "Shop not found" });

    await updateServiceService(Number(req.params.id), shopId, req.body);
    return res.json({ message: "Service updated successfully" });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

export const deleteServiceById = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const shopId = await getShopIdByUserId(userId);
    if (!shopId) return res.status(404).json({ message: "Shop not found" });

    await deleteServiceService(Number(req.params.id), shopId);
    return res.json({ message: "Service deleted successfully" });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};
