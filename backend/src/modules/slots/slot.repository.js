import { and, eq } from "drizzle-orm";

import { slots } from "../../db/schemas/slots.js";
import { db } from "../../db/index.js";

export class SlotRepository {
  static findDuplicate(shopId, slotDate, startTime, endTime) {
    return db
      .select()
      .from(slots)
      .where(
        and(
          eq(slots.shopId, shopId),
          eq(slots.slotDate, slotDate),
          eq(slots.startTime, startTime),
          eq(slots.endTime, endTime)
        )
      );
  }

  static create(shopId, data) {
    const { slotDate, startTime, endTime, maxCapacity, isAvailable } = data;
    const insertData = {
      shopId,
      slotDate,
      startTime,
      endTime,
      maxCapacity: maxCapacity ?? 1,
      isAvailable: isAvailable ?? true,
      bookedCount: isAvailable === false ? 1 : 0,
      isRecurring: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return db.insert(slots).values(insertData);
  }

  static findAllByShop(shopId) {
    return db.select().from(slots).where(eq(slots.shopId, shopId));
  }
}

export const findSlotByIdAndShop = (id, shopId) => {
  return db
    .select({ id: slots.id })
    .from(slots)
    .where(and(eq(slots.id, id), eq(slots.shopId, shopId)));
};

export const updateSlotDB = (id, data) => {
  return db.update(slots).set(data).where(eq(slots.id, id));
};

export const deleteSlotDB = (id) => {
  return db.delete(slots).where(eq(slots.id, id));
};
