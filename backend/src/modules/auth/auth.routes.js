import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { googleSignIn } from "./auth.controller.js";

import { shopOwners } from "../../db/schemas/shop-owners.js";
import { eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import { createUser } from "../users/user.controller.js";

const router = express.Router();

router.get("/me", authMiddleware, (req, res) => {
  res.json({
    user: req.user,
  });
});

router.post("/signin/google", googleSignIn);
router.post("/signup", createUser);

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    const [shop] = await db
      .select()
      .from(shopOwners)
      .where(eq(shopOwners.userId, user.id))
      .limit(1);

    return res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      profileImage: user.profileImage,
      role: shop ? "SHOP_OWNER" : "CUSTOMER",
      shop: shop || null,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
