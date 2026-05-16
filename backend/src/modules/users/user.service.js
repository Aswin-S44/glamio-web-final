import jwt from "jsonwebtoken";

import { users } from "../../db/schemas/users.js";
import { DEFAULT_CUSTOMER_ID, DEFAULT_SHOP_ID } from "../../constants/constants.js";
import { db } from "../../db/index.js";
import { eq } from "drizzle-orm";
import { shopOwners } from "../../db/schemas/shop-owners.js";

const getUserType = (shopProfile) => (shopProfile ? "shop" : "customer");

const createDefaultShopProfile = async (userId) => {
  const shopPayload = {
    userId,
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

  const shopResult = await db.insert(shopOwners).values(shopPayload).returning();
  return shopResult[0] || null;
};

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
  console.log("Creating user with payload:", userType, email, username);

  if (!email || !username) {
    throw new Error("email and username are required");
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  console.log("Existing user query result:", existingUser);

  if (existingUser.length > 0) {
    console.log("User already exists with email:", email);
    let user = existingUser[0];
    let shopDetails = null;

    if (userType === "shop" && user.userTypeId !== DEFAULT_SHOP_ID) {
      const [updatedUser] = await db
        .update(users)
        .set({
          userTypeId: DEFAULT_SHOP_ID,
          username,
          profileImage,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning();

      user = updatedUser || user;
    }

    if (user.userTypeId === DEFAULT_SHOP_ID || userType === "shop") {
      const existingShop = await db
        .select()
        .from(shopOwners)
        .where(eq(shopOwners.userId, user.id))
        .limit(1);

      shopDetails = existingShop[0] || null;

      if (!shopDetails) {
        shopDetails = await createDefaultShopProfile(user.id);
      }
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    return {
      user: {
        ...user,
        shopProfile: shopDetails,
        userType: getUserType(shopDetails),
      },
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
    shopDataResponse = await createDefaultShopProfile(newUser.id);
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  return {
    user: {
      ...newUser,
      shopProfile: shopDataResponse,
      userType: getUserType(shopDataResponse),
    },
    token,
  };
};
