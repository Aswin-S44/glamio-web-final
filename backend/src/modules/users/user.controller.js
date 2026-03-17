import { createUserService } from "./user.service.js";

export const createUser = async (req, res) => {
  try {
    const result = await createUserService(req.body);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    res.status(error.message?.includes("exists") ? 409 : 400).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
