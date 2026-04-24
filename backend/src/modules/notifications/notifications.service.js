import { createNotificationRepo } from "./notifications.repository.js";

export const createNotificationService = async (data) => {
  return await createNotificationRepo(data);
};
