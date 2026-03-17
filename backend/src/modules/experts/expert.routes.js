import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  addExpert,
  deleteExpertById,
  getExpertById,
  getExperts,
  updateExpertById,
} from "./expert.controller.js";

const router = Router();

router.post("/", authMiddleware, addExpert);
router.get("/", authMiddleware, getExperts);
router.get("/:id", authMiddleware, getExpertById);
router.patch("/:id", authMiddleware, updateExpertById);
router.delete("/:id", authMiddleware, deleteExpertById);

export default router;
