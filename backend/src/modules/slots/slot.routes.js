import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
  createSlot,
  deleteSlotById,
  getSlots,
  updateSlotById,
} from "./slot.controller.js";

const router = Router();

router.post("/", authMiddleware, createSlot);
router.get("/", authMiddleware, getSlots);
router.patch("/:id", authMiddleware, updateSlotById);
router.delete("/:id", authMiddleware, deleteSlotById);

export default router;
