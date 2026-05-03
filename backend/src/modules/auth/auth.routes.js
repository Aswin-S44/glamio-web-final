import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
  changePassword,
  googleSignIn,
  login,
  register,
  updateFcmToken,
  updateProfile,
} from "./auth.controller.js";
import { shopOwners } from "../../db/schemas/shop-owners.js";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/signin/google", googleSignIn);

router.get("/me", authMiddleware, (req, res) => {
  const u = req.user;
  res.json({
    id: u.id,
    email: u.email,
    username: u.username,
    phone: u.phone,
    profileImage: u.profileImage,
    emailVerified: u.emailVerified,
    fcmToken: u.fcmToken,
  });
});

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

router.patch("/profile", authMiddleware, updateProfile);
router.patch("/fcm-token", authMiddleware, updateFcmToken);
router.patch("/change-password", authMiddleware, changePassword);

export default router;
