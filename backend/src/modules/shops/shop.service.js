import {
  findShopByUserId,
  getShopStatsRepo,
  updateShopDB,
} from "./shop.repository.js";

export const updateShopProfile = async (id, data) => {
  const result = await findShopByUserId(id);

  const shop = result?.shop;
  const user = result?.user;

  if (!user) {
    throw new Error("User not found!");
  }

  await updateShopDB(id, data);
};

export const getShopDashboardStats = async (shopId) => {
  const stats = await getShopStatsRepo(shopId);

  return {
    ...stats,
    revenueGrowth: "+12.5%",
    appointmentGrowth: "+5.2%",
    clientGrowth: "+18 new today",
  };
};
