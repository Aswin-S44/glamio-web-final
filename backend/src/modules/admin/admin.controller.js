import { getAllShopsRepo, approveShopRepo, rejectShopRepo } from "./admin.repository.js";

export const getAllShops = async (req, res) => {
  try {
    const shops = await getAllShopsRepo();
    res.json({ shops });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to fetch shops" });
  }
};

export const approveShop = async (req, res) => {
  try {
    const { id } = req.params;
    await approveShopRepo(id);
    res.json({ message: "Shop approved successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to approve shop" });
  }
};

export const rejectShop = async (req, res) => {
  try {
    const { id } = req.params;
    await rejectShopRepo(id);
    res.json({ message: "Shop rejected successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to reject shop" });
  }
};
