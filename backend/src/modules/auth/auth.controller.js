import {
  changePasswordService,
  googleSignInService,
  loginService,
  registerService,
  updateFcmTokenService,
  updateProfileService,
} from "./auth.service.js";

export const googleSignIn = async (req, res) => {
  try {
    const { idToken } = req.body;
    const result = await googleSignInService(idToken);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message || "Invalid Google token" });
  }
};

export const register = async (req, res) => {
  try {
    const result = await registerService(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(error.message?.includes("already") ? 409 : 400).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const result = await loginService(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
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

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    await changePasswordService(req.user.id, oldPassword, newPassword);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
