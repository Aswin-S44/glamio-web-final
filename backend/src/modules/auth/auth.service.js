import jwt from "jsonwebtoken";
import admin from "../../config/firebase.js";
import { db } from "../../db/index.js";
import { users } from "../../db/schemas/users.js";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET;

export const googleSignInService = async (idToken) => {
  if (!idToken) throw new Error("ID token is required");

  const decodedToken = await admin.auth().verifyIdToken(idToken);
  const { uid, email, name, picture } = decodedToken;

  if (!email) throw new Error("Email not found in Google token");

  const token = jwt.sign({ uid, email }, JWT_SECRET, { expiresIn: "30d" });

  return { token, user: { uid, email, name, picture } };
};

export const updateProfileService = async (userId, data) => {
  const allowed = {};
  if (data.username) allowed.username = data.username;
  if (data.phone !== undefined) allowed.phone = data.phone;
  if (data.profileImage) allowed.profileImage = data.profileImage;

  await db
    .update(users)
    .set({ ...allowed, updatedAt: new Date() })
    .where(eq(users.id, userId));

  const [updated] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return updated;
};

export const updateFcmTokenService = async (userId, fcmToken) => {
  await db
    .update(users)
    .set({ fcmToken, updatedAt: new Date() })
    .where(eq(users.id, userId));
};
