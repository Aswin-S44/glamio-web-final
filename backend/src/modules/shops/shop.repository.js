import { and, count, countDistinct, eq, gte, sql, sum } from "drizzle-orm";
import { users } from "../../db/schemas/users.js";
import { shopOwners } from "../../db/schemas/shop-owners.js";
import { appointments } from "../../db/schemas/appointments.js";
import { db } from "../../db/index.js";

export const findShopByUserId = async (userId) => {
  const result = await db
    .select({
      user: users,
      shop: shopOwners,
    })
    .from(users)
    .leftJoin(shopOwners, eq(shopOwners.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0] ?? null;
};

export const updateShopDB = async (userId, payload) => {
  const { user, shop } = payload;

  const shopDetails = await findShopByUserId(userId);

  return db.transaction(async (tx) => {
    if (user && Object.keys(user).length > 0) {
      await tx
        .update(users)
        .set({
          username: user.username,
          phone: user.phone,
          profileImage: user.profileImage,
          fcmToken: user.fcmToken,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }

    if (shop && Object.keys(shop).length > 0) {
      let shopId = shopDetails?.shop?.id;

      if (shopId) {
        await tx
          .update(shopOwners)
          .set({
            about: shop.about,
            address: shop.address,
            latitude: shop.latitude,
            longitude: shop.longitude,
            googleReviewUrl: shop.googleReviewUrl,
            openingHours: shop.openingHours,
            parlourName: shop.parlourName,
            placeId: shop.placeId,
            totalRating: shop.totalRating,
            isProfileCompleted: shop.isProfileCompleted,
            isOnboarded: shop.isOnboarded,
          })
          .where(eq(shopOwners.id, shopId));
      } else {
        const [result] = await tx
          .insert(shopOwners)
          .values({
            userId,
            about: shop.about,
            address: shop.address,
            latitude: shop.latitude ?? 0,
            longitude: shop.longitude ?? 0,
            googleReviewUrl: shop.googleReviewUrl,
            openingHours: shop.openingHours ?? {},
            parlourName: shop.parlourName,
            placeId: shop.placeId,
            totalRating: shop.totalRating ?? 0,
            isProfileCompleted: shop.isProfileCompleted ?? false,
            isOnboarded: shop.isOnboarded ?? false,
          })
          .returning();
        shopId = result.insertId;
      }
    }
  });
};

export const getShopStatsRepo = async (shopId) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [totals] = await db
    .select({
      totalRevenue: sum(appointments.rate),
      totalAppointments: count(appointments.id),
      activeClients: countDistinct(appointments.customerId),
    })
    .from(appointments)
    .where(eq(appointments.shopId, shopId));

  const chartData = await db
    .select({
      date: sql`DATE(${appointments.createdAt})`,
      revenue: sum(appointments.rate),
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.shopId, shopId),
        gte(appointments.createdAt, sevenDaysAgo)
      )
    )
    .groupBy(sql`DATE(${appointments.createdAt})`)
    .orderBy(sql`DATE(${appointments.createdAt})`);

  return {
    totalRevenue: Number(totals?.totalRevenue || 0),
    appointments: totals?.totalAppointments || 0,
    activeClients: totals?.activeClients || 0,
    chartData: chartData.map((d) => ({
      day: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
        new Date(d.date)
      ),
      revenue: Number(d.revenue || 0),
    })),
  };
};
