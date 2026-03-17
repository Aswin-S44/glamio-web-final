import jwt from "jsonwebtoken";
import admin from "../../config/firebase.js";
const JWT_SECRET = process.env.JWT_SECRET;

export const googleSignInService = async (idToken) => {
  if (!idToken) {
    throw new Error("ID token is required");
  }

  const decodedToken = await admin.auth().verifyIdToken(idToken);

  const { uid, email, name, picture } = decodedToken;

  if (!email) {
    throw new Error("Email not found in Google token");
  }

  const token = jwt.sign({ uid, email }, JWT_SECRET, {
    expiresIn: "30d",
  });

  return {
    token,
    user: {
      uid,
      email,
      name,
      picture,
    },
  };
};
