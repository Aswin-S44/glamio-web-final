import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { getProfileById, getStats, updateProfile } from "./shop.controller.js";
import { db } from "../../db/index.js";
import { notifications } from "../../db/schemas/notifications.js";
import { desc, eq } from "drizzle-orm";

const router = Router();

router.get("/", authMiddleware, getProfileById);
router.patch("/", authMiddleware, updateProfile);
router.get("/stats", authMiddleware, getStats);

router.get("/notifications", authMiddleware, async (req, res) => {
  try {
    const list = await db
      .select()
      .from(notifications)
      .where(eq(notifications.toId, req.user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
    res.json({ notifications: list });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.patch("/notifications/:id/read", authMiddleware, async (req, res) => {
  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/notifications/:id", authMiddleware, async (req, res) => {
  try {
    const [notif] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, Number(req.params.id)))
      .limit(1);
    res.json(notif || null);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
  