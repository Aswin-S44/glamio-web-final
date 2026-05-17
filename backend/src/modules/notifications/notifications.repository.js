import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js"; // Explicitly add /index.js
import { notificationTypes } from "../../db/schemas/notification-types.js";
import { notifications } from "../../db/schemas/notifications.js";
import { shopOwners } from "../../db/schemas/shop-owners.js";
import { users } from "../../db/schemas/users.js";

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

export const getNotificationsDB = async (userId) => {
  return await db
    .select({
      notification: notifications,

      fromUser: {
        id: users.id,
        username: users.username,
        email: users.email,
        profileImage: users.profileImage,
      },

      shop: {
        id: shopOwners.id,
        parlourName: shopOwners.parlourName,
        shopImage: shopOwners.shopImage,
      },

      notificationType: notificationTypes,
    })
    .from(notifications)

    .leftJoin(users, eq(notifications.fromId, users.id))

    .leftJoin(shopOwners, eq(notifications.shopId, shopOwners.id))

    .leftJoin(
      notificationTypes,
      eq(notifications.notificationTypeId, notificationTypes.id)
    )

    .where(eq(notifications.toId, userId))

    .orderBy(desc(notifications.createdAt));
};

export const markNotificationAsReadDB = async (id) => {
  return await db
    .update(notifications)
    .set({
      isRead: true,
      updatedAt: new Date(),
    })
    .where(eq(notifications.id, id));
};

export const findNotificationById = async (id) => {
  return await db.select().from(notifications).where(eq(notifications.id, id));
};

export const deleteNotificationDB = async (id, userId) => {
  return await db
    .delete(notifications)
    .where(and(eq(notifications.id, id), eq(notifications.toId, userId)));
};
