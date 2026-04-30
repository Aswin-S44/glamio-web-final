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
      const userFields = { updatedAt: new Date() };
      if (user.username     !== undefined) userFields.username     = user.username;
      if (user.phone        !== undefined) userFields.phone        = user.phone;
      if (user.profileImage !== undefined) userFields.profileImage = user.profileImage;
      if (user.fcmToken     !== undefined) userFields.fcmToken     = user.fcmToken;
      await tx.update(users).set(userFields).where(eq(users.id, userId));
    }

    if (shop && Object.keys(shop).length > 0) {
      let shopId = shopDetails?.shop?.id;

      if (shopId) {
        // Only include fields that were explicitly provided — avoids
        // writing undefined into NOT NULL columns (latitude, longitude, etc.)
        const shopFields = {};
        if (shop.about        !== undefined) shopFields.about        = shop.about;
        if (shop.address      !== undefined) shopFields.address      = shop.address;
        if (shop.latitude     !== undefined) shopFields.latitude     = shop.latitude;
        if (shop.longitude    !== undefined) shopFields.longitude    = shop.longitude;
        if (shop.googleReviewUrl !== undefined) shopFields.googleReviewUrl = shop.googleReviewUrl;
        if (shop.openingHours !== undefined) shopFields.openingHours = shop.openingHours;
        if (shop.parlourName  !== undefined) shopFields.parlourName  = shop.parlourName;
        if (shop.placeId      !== undefined) shopFields.placeId      = shop.placeId;
        if (shop.totalRating  !== undefined) shopFields.totalRating  = shop.totalRating;
        if (shop.isProfileCompleted !== undefined) shopFields.isProfileCompleted = shop.isProfileCompleted;
        if (shop.isOnboarded  !== undefined) shopFields.isOnboarded  = shop.isOnboarded;
        if (shop.shopImage    !== undefined) shopFields.shopImage    = shop.shopImage;
        if (shop.galleryImages !== undefined) shopFields.galleryImages = shop.galleryImages;

        if (Object.keys(shopFields).length > 0) {
          await tx.update(shopOwners).set(shopFields).where(eq(shopOwners.id, shopId));
        }
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

export const getShopStatsRepo = async (shopId, timeframe = "weekly") => {
  const daysToShow = timeframe === "monthly" ? 30 : 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysToShow);

  const [totals] = await db
    .select({
      totalRevenue: sum(appointments.rate),
      totalAppointments: count(appointments.id),
      activeClients: countDistinct(appointments.customerId),
    })
    .from(appointments)
    .where(eq(appointments.shopId, shopId));

  const rawChartData = await db
    .select({
      date: sql`DATE(${appointments.createdAt})`,
      revenue: sum(appointments.rate),
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.shopId, shopId),
        gte(appointments.createdAt, startDate)
      )
    )
    .groupBy(sql`DATE(${appointments.createdAt})`)
    .orderBy(sql`DATE(${appointments.createdAt})`);

  const fullChartData = [];
  for (let i = daysToShow - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateString = d.toISOString().split("T")[0];

    const dayLabel =
      timeframe === "monthly"
        ? d.getDate().toString() // Show date number for monthly
        : new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(d);

    const existingDay = rawChartData.find(
      (row) => new Date(row.date).toISOString().split("T")[0] === dateString
    );

    fullChartData.push({
      day: dayLabel,
      revenue: Number(existingDay?.revenue || 0),
    });
  }

  return {
    totalRevenue: Number(totals?.totalRevenue || 0),
    appointments: Number(totals?.totalAppointments || 0),
    activeClients: Number(totals?.activeClients || 0),
    chartData: fullChartData,
  };
};
