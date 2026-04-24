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

export const getShopDashboardStats = async (shopId, timeframe) => {
  const stats = await getShopStatsRepo(shopId, timeframe);

  return {
    ...stats,
    revenueGrowth: timeframe === "monthly" ? "+22.4%" : "+12.5%",
    appointmentGrowth: timeframe === "monthly" ? "+15.2%" : "+5.2%",
    clientGrowth:
      timeframe === "monthly" ? "+45 new this month" : "+18 new today",
  };
};
