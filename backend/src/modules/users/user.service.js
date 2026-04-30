import jwt from "jsonwebtoken";

import { users } from "../../db/schemas/users.js";
import {
  DEFAULT_CUSTOMER_ID,
  DEFAULT_SHOP_ID,
} from "../../constants/constants.js";
import { db } from "../../db/index.js";
import { eq } from "drizzle-orm";
import { shopOwners } from "../../db/schemas/shop-owners.js";

export const createUser = async (data) => {
  const result = await db
    .insert(users)
    .values({
      ...data,
      isActive: true,
      emailVerified: false,
    })
    .returning();

  return result[0];
};

export const createUserService = async (payload) => {
  const { email, username, profileImage, userType } = payload;

  if (!email || !username) {
    throw new Error("email and username are required");
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    let user = existingUser[0];

    // If signing up as shop but user was previously a customer, upgrade their type
    if (userType === "shop" && user.userTypeId !== DEFAULT_SHOP_ID) {
      await db
        .update(users)
        .set({ userTypeId: DEFAULT_SHOP_ID })
        .where(eq(users.id, user.id));
      user = { ...user, userTypeId: DEFAULT_SHOP_ID };
    }

    // Always fetch shop profile regardless of current userTypeId
    const shop = await db
      .select()
      .from(shopOwners)
      .where(eq(shopOwners.userId, user.id))
      .limit(1);
    const shopDetails = shop[0] || null;

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    return {
      user: { ...user, shopProfile: shopDetails },
      token,
    };
  }

  const userTypeId =
    userType === "shop" ? DEFAULT_SHOP_ID : DEFAULT_CUSTOMER_ID;

  const newUser = await createUser({
    email,
    username,
    profileImage,
    userTypeId,
  });

  let shopDataResponse = null;

  if (userTypeId === DEFAULT_SHOP_ID && newUser) {
    const shopPayload = {
      userId: newUser.id,
      about: "",
      address: "",
      latitude: 0,
      longitude: 0,
      googleReviewUrl: "",
      isOnboarded: false,
      openingHours: {},
      parlourName: "",
      placeId: "",
      totalRating: 0,
      isProfileCompleted: false,
    };

    const shopResult = await db
      .insert(shopOwners)
      .values(shopPayload)
      .returning();

    shopDataResponse = shopResult[0] || null;
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  return {
    user: { ...newUser, shopProfile: shopDataResponse },
    token,
  };
};
