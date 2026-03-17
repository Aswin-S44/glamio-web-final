import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
  createService,
  deleteServiceById,
  getServiceById,
  getServices,
  updateServiceById,
} from "./service.controller.js";

const router = Router();

router.post("/", authMiddleware, createService);
router.get("/", authMiddleware, getServices);
router.get("/:id", authMiddleware, getServiceById);
router.patch("/:id", authMiddleware, updateServiceById);
router.delete("/:id", authMiddleware, deleteServiceById);

export default router;
