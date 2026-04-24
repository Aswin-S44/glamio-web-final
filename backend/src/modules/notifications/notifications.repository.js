import { db } from "../../db/index.js"; // Explicitly add /index.js
import { notifications } from "../../db/schemas/notifications.js";

export const createNotificationRepo = async (notificationData) => {
  const [newNotification] = await db
    .insert(notifications)
    .values({
      notificationTypeId: notificationData.notificationTypeId,
      fromId: notificationData.fromId,
      toId: notificationData.toId,
      message: notificationData.message,
      shopId: notificationData.shopId,
      isRead: false,
    })
    .returning();

  return newNotification;
};
