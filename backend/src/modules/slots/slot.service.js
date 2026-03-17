import { findShopByUserId } from "../shops/shop.repository.js";
import {
  deleteSlotDB,
  findSlotByIdAndShop,
  SlotRepository,
  updateSlotDB,
} from "./slot.repository.js";

export class SlotService {
  static async createSlot(shopId, data) {
    const { slotDate, startTime, endTime } = data;

    const existing = await SlotRepository.findDuplicate(
      shopId,
      slotDate,
      startTime,
      endTime
    );

    if (existing.length > 0) {
      throw new Error("Slot already exists for this time");
    }

    await SlotRepository.create(shopId, data);
  }

  static async getSlots(shopId) {
    return SlotRepository.findAllByShop(shopId);
  }
}

export const updateSlotService = async (id, shopId, data) => {
  const exists = await findSlotByIdAndShop(id, shopId);
  if (!exists.length) throw new Error("Slots not found");

  await updateSlotDB(id, data);
};

export const deleteSlotService = async (id, shopId) => {
  const exists = await findSlotByIdAndShop(id, shopId);
  if (!exists.length) throw new Error("Slots not found");

  await deleteSlotDB(id);
};

export const getShopIdByUserId = async (userId) => {
  const shop = await findShopByUserId(userId);

  if (!shop) {
    return null;
  }

  const shopId = shop.shop?.id;

  if (!shopId) {
    return null;
  }
  return shopId;
};
