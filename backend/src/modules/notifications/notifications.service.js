import {
  createNotificationRepo,
  findNotificationById,
  getNotificationsDB,
  markNotificationAsReadDB,
} from "./notifications.repository.js";

export const createNotificationService = async (data) => {
  return await createNotificationRepo(data);
};

export const getNotificationsService = async (userId) => {
  return await getNotificationsDB(userId);
};

export const markNotificationAsReadService = async (notificationId, userId) => {
  const notification = await findNotificationById(notificationId);

  if (!notification.length) {
    throw new Error("Notification not found");
  }

  if (notification[0].toId !== userId) {
    throw new Error("Unauthorized");
  }

  await markNotificationAsReadDB(notificationId);
};
