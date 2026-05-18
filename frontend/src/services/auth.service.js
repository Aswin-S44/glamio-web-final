import api from "../utils/api.util";

export const googleSignInApi = async (idToken, userType) => {
  const response = await api.post("/auth/signin/google", {
    idToken,
    userType,
  });

  return response.data;
};

export const completeGoogleAuth = async ({ idToken, userType }) => {
  return googleSignInApi(idToken, userType);
};
