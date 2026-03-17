import axios from "axios";
import { BASE_URL } from "../constants/urls";

const API_URL = `${BASE_URL}/auth`;

export const googleSignInApi = async (idToken) => {
  const response = await axios.post(`${API_URL}/signin/google`, {
    idToken,
  });

  return response.data;
};
