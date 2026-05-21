import { createUserService } from "../users/user.service.js";
import {
  googleSignInService,
  updateFcmTokenService,
  updateProfileService,
} from "./auth.service.js";

export const googleSignIn = async (req, res) => {
  try {
    const { idToken, userType } = req.body;

    const firebaseResult = await googleSignInService(idToken);

    const dbResult = await createUserService({
      email: firebaseResult.user.email ?? "",
      username: firebaseResult.user.name ?? "",
      profileImage: firebaseResult.user.picture ?? "",
      userType,
    });

    res.status(200).json({
      success: true,
      data: {
        token: dbResult.token,
        user: dbResult.user,
      },
    });
  } catch (error) {
    console.error("Google sign-in error:", error);
    res.status(401).json({
      success: false,
      message: error.message || "Invalid Google token",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updated = await updateProfileService(req.user.id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateFcmToken = async (req, res) => {
  try {
    await updateFcmTokenService(req.user.id, req.body.fcmToken);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
