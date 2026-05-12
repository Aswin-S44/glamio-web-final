import { createUserService } from "../users/user.service.js";
import { googleSignInService } from "./auth.service.js";

export const googleSignIn = async (req, res) => {
  try {
    const { idToken, userType } = req.body;
    console.log("===================");
    const result = await googleSignInService(idToken);
    console.log("result----------", result ? result : "no result");

    if (result && result.user) {
      let userData = {
        email: result.user.email ?? "",
        username: result.user.name ?? "",
        profileImage: result.user.picture ?? DEFAULT_IMAGE_URL,
        userType,
      };
      await createUserService(userData);
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("DETAILED BACKEND ERROR:", error);
    res.status(401).json({
      success: false,
      message: error.message || "Invalid Google token",
    });
  }
};
