import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import admin from "../../config/firebase.js";
import { createUserService } from "../users/user.service.js";
import { db } from "../../db/index.js";
import { users } from "../../db/schemas/users.js";
import { eq } from "drizzle-orm";
import { DEFAULT_CUSTOMER_ID } from "../../constants/constants.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const googleSignInService = async (idToken) => {
  if (!idToken) throw new Error("ID token is required");

  const decodedToken = await admin.auth().verifyIdToken(idToken);
  const { uid, email, name, picture } = decodedToken;

  if (!email) throw new Error("Email not found in Google token");

  const upserted = await createUserService({
    email,
    username: name || email.split("@")[0],
    profileImage: picture,
    userType: "customer",
  });

  return {
    token: upserted.token,
    user: {
      uid,
      email,
      name,
      picture,
      shopProfile: upserted.user?.shopProfile ?? null,
      role: upserted.user?.shopProfile ? "SHOP_OWNER" : "CUSTOMER",
    },
  };
};

export const registerService = async ({ email, password, username }) => {
  if (!email || !password || !username) {
    throw new Error("email, password, and username are required");
  }

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) throw new Error("Email already in use");

  const passwordHash = await bcrypt.hash(password, 10);

  const [newUser] = await db.insert(users).values({
    email,
    username,
    passwordHash,
    isActive: true,
    emailVerified: false,
    userTypeId: DEFAULT_CUSTOMER_ID,
  }).returning();

  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "30d" });
  return { token, user: newUser };
};

export const loginService = async ({ email, password }) => {
  if (!email || !password) throw new Error("email and password are required");

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) throw new Error("Invalid email or password");

  if (!user.passwordHash) throw new Error("Please sign in with Google");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error("Invalid email or password");

  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "30d" });
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      profileImage: user.profileImage,
      emailVerified: user.emailVerified,
      phone: user.phone,
    },
  };
};

export const updateProfileService = async (userId, data) => {
  const allowed = {};
  if (data.username) allowed.username = data.username;
  if (data.phone !== undefined) allowed.phone = data.phone;
  if (data.profileImage) allowed.profileImage = data.profileImage;

  await db.update(users).set({ ...allowed, updatedAt: new Date() }).where(eq(users.id, userId));
  const [updated] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return updated;
};

export const updateFcmTokenService = async (userId, fcmToken) => {
  await db.update(users).set({ fcmToken, updatedAt: new Date() }).where(eq(users.id, userId));
};

export const changePasswordService = async (userId, oldPassword, newPassword) => {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new Error("User not found");
  if (!user.passwordHash) throw new Error("No password set — use Google sign-in");
  const valid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!valid) throw new Error("Current password is incorrect");
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, userId));
};
