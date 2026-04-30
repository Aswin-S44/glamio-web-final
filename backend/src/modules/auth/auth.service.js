import jwt from "jsonwebtoken";
import admin from "../../config/firebase.js";
import { createUserService } from "../users/user.service.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const googleSignInService = async (idToken) => {
  if (!idToken) throw new Error("ID token is required");

  const decodedToken = await admin.auth().verifyIdToken(idToken);
  const { uid, email, name, picture } = decodedToken;

  if (!email) throw new Error("Email not found in Google token");

  /* Upsert the user — creates if new, returns existing record if found.
     Using "customer" as default userType; existing shop owners keep their type. */
  const upserted = await createUserService({
    email,
    username: name,
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
