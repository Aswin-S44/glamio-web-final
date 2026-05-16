import { z } from "zod";

export const updateUserSchema = z.object({
  username: z.string().min(2).optional(),
  phone: z.string().min(10).max(15).optional(),
  profileImage: z.string().optional(),
  fcmToken: z.string().optional(),
  isActive: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  userTypeId: z.number().optional(),
});
