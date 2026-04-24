import { createNotificationService } from "./notifications.service.js";

export const sendNotification = async (req, res) => {
  try {
    // const fromId = req.user?.id;
    // const { notificationTypeId, toId, message, shopId } = req.body;
    // if (!fromId) {
    //   return res.status(401).json({ message: "Unauthorized" });
    // }
    // if (!notificationTypeId || !toId || !message || !shopId) {
    //   return res.status(400).json({ message: "Missing required fields" });
    // }
    // const notification = await createNotificationService({
    //   notificationTypeId,
    //   fromId,
    //   toId,
    //   message,
    //   shopId,
    // });
    // res.status(201).json({
    //   message: "Notification sent successfully",
    //   notification,
    // });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating notification" });
  }
};
