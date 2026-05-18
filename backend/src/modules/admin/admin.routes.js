import { Router } from "express";
import { getAllShops, approveShop, rejectShop } from "./admin.controller.js";
import * as bannerController from "./banner.controller.js";
import * as offerBannerController from "./offerBanner.controller.js";

const router = Router();

/* Simple admin key middleware — checks Authorization header */
const adminAuth = (req, res, next) => {
  const auth = req.headers.authorization || "";
  const ADMIN_KEY = Buffer.from("admin@glamio.com:Admin@123").toString(
    "base64"
  );
  if (auth === `admin ${ADMIN_KEY}`) return next();
  return res.status(401).json({ message: "Unauthorized" });
};

router.get("/shops", adminAuth, getAllShops);
router.patch("/shops/:id/approve", adminAuth, approveShop);
router.patch("/shops/:id/reject", adminAuth, rejectShop);

router.get("/banners", bannerController.getAllBanners);
router.post("/banners", bannerController.createBanner);
router.put("/banners/:id", bannerController.updateBanner);
router.delete("/banners/:id", bannerController.deleteBanner);

router.get("/offers", offerBannerController.getAllOfferBanners);
router.post("/offers", offerBannerController.createOfferBanner);
router.put("/offers/:id", offerBannerController.updateOfferBanner);
router.delete("/offers/:id", offerBannerController.deleteOfferBanner);

export default router;
