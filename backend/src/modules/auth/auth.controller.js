import { createUserService } from "../users/user.service.js";
import { googleSignInService } from "./auth.service.js";

export const googleSignIn = async (req, res) => {
  console.log("Received Google sign-in request with body:", req.body);
  try {
    const { idToken, userType } = req.body;
    console.log("===================", userType);
    const googleResult = await googleSignInService(idToken);
    console.log("result----------", googleResult ? googleResult : "no result");

    if (googleResult && googleResult.user) {
      const authResult = await createUserService({
        email: googleResult.user.email ?? "",
        username: googleResult.user.name ?? "",
        profileImage: googleResult.user.picture ?? "",
        userType,
      });

      return res.status(200).json({
        success: true,
        token: authResult.token,
        user: authResult.user,
      });
    }

    throw new Error("Google account details were not returned");
  } catch (error) {
    console.error("DETAILED BACKEND ERROR:", error);
    res.status(401).json({
      success: false,
      message: error.message || "Invalid Google token",
    });
  }
};
