import axios from "axios";

import { BASE_URL } from "../constants/urls";

export const googleSignInApi = async (idToken, userType) => {
  const response = await axios.post(`${BASE_URL}/auth/signin/google`, {
    idToken,
    userType,
  });

  return response.data;
};

export const completeGoogleAuth = async ({ idToken, userType }) => {
  return googleSignInApi(idToken, userType);
};
