import { findShopByUserId } from "../shops/shop.repository.js";
import {
  deleteSlotService,
  getShopIdByUserId,
  SlotService,
  updateSlotService,
} from "./slot.service.js";

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

export const createSlot = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const shop = await findShopByUserId(userId);
    if (!shop?.shop?.id) {
      res.status(404).json({ message: "Shop not found" });
      return;
    }

    await SlotService.createSlot(shop.shop.id, req.body);
    res.status(201).json({ message: "Slot created successfully" });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getSlots = async (req, res) => {
  try {
    const shopId = await resolveShopId(req, res);
    if (!shopId) return;

    const slots = await SlotService.getSlots(shopId);
    res.status(200).json({ slots });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateSlotById = async (req, res) => {
  try {
    const shopId = await resolveShopId(req, res);
    if (!shopId) return;

    await updateSlotService(Number(req.params.id), shopId, req.body);
    res.json({ message: "Slots updated successfully" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const deleteSlotById = async (req, res) => {
  try {
    const shopId = await resolveShopId(req, res);
    if (!shopId) return;

    await deleteSlotService(Number(req.params.id), shopId);
    res.json({ message: "Slots deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
