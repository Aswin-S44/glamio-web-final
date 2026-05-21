import { getShopIdByUserId } from "../slots/slot.service.js";
import {
  addExpertService,
  deleteExpertService,
  getExpertByIdService,
  getExpertsService,
  updateExpertService,
} from "./expert.service.js";

const getShopId = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }
  const shopId = await getShopIdByUserId(userId);
  if (!shopId) {
    res.status(404).json({ message: "Shop not found for this account" });
    return null;
  }
  return shopId;
};

export const addExpert = async (req, res) => {
  try {
    const shopId = await getShopId(req, res);
    if (!shopId) return;

    await addExpertService(shopId, req.body);
    res.status(201).json({ message: "Expert created successfully" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const getExperts = async (req, res) => {
  try {
    const shopId = await getShopId(req, res);
    if (!shopId) return;

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 8));
    const search = (req.query.search || "").trim().toLowerCase();
    const specialist = (req.query.specialist || "").trim();

    const allExperts = await getExpertsService(shopId);

    let filtered = allExperts;
    if (search) {
      filtered = filtered.filter(
        (e) =>
          e.name?.toLowerCase().includes(search) ||
          e.specialist?.toLowerCase().includes(search) ||
          e.about?.toLowerCase().includes(search)
      );
    }
    if (specialist) {
      filtered = filtered.filter(
        (e) => e.specialist?.toLowerCase() === specialist.toLowerCase()
      );
    }

    const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
    const safePage = Math.min(page, totalPages);
    const paginated = filtered.slice((safePage - 1) * limit, safePage * limit);

    res.json({
      experts: paginated,
      pagination: { currentPage: safePage, totalPages, limit },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getExpertById = async (req, res) => {
  try {
    const shopId = await getShopId(req, res);
    if (!shopId) return;

    const expert = await getExpertByIdService(Number(req.params.id), shopId);
    res.json(expert);
  } catch (e) {
    res.status(404).json({ message: e.message });
  }
};

export const updateExpertById = async (req, res) => {
  try {
    const shopId = await getShopId(req, res);
    if (!shopId) return;

    await updateExpertService(Number(req.params.id), shopId, req.body);
    res.json({ message: "Expert updated successfully" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const deleteExpertById = async (req, res) => {
  try {
    const shopId = await getShopId(req, res);
    if (!shopId) return;

    await deleteExpertService(Number(req.params.id), shopId);
    res.json({ message: "Expert deleted successfully" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
