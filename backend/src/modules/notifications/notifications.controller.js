import {
  createNotificationService,
  getNotificationsService,
  markNotificationAsReadService,
} from "./notifications.service.js";

export const sendNotification = async (req, res) => {
  try {
    const fromId = req.user?.id;
    console.log("BODY--------------", req.body);
    const { notificationTypeId, toId, message, shopId } = req.body;
    if (!fromId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!notificationTypeId || !toId || !message || !shopId) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const notification = await createNotificationService({
      notificationTypeId,
      fromId,
      toId,
      message,
      shopId,
    });
    res.status(201).json({
      message: "Notification sent successfully",
      notification,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating notification" });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const notifications = await getNotificationsService(userId);

    console.log("notifications--------------", notifications);

    return res.json({
      message: "Notifications fetched successfully",
      data: notifications,
    });
  } catch (e) {
    return res.status(400).json({
      message: e.message,
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const notificationId = Number(req.params.id);

    await markNotificationAsReadService(notificationId, userId);

    return res.json({
      message: "Notification marked as read",
    });
  } catch (e) {
    return res.status(400).json({
      message: e.message,
    });
  }
};
