import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../config/firebase";
import api from "../../utils/api.util";

export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (_, { rejectWithValue }) => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const idToken = await result.user.getIdToken();

      const response = await api.post("/auth/signin/google", {
        idToken,
      });

      if (response && response.data.data) {
        let dataToSignup = {
          email: response.data.data.user.email,
          username: response.data.data.user.name,
          profileImage: response.data.data.user.picture,
          userType: "shop",
        };

        const userResponse = await api.post("/auth/signup", dataToSignup);

        if (userResponse && userResponse.data.success) {
          return userResponse.data;
        }
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Google sign-in failed"
      );
    }
  }
);

// export const googleLogin = createAsyncThunk(
//   "auth/googleLogin",
//   async (_, { rejectWithValue }) => {
//     try {
//       const provider = new GoogleAuthProvider();
//       const result = await signInWithPopup(auth, provider);

//       const idToken = await result.user.getIdToken();

//       const response = await api.post("/auth/signin/google", {
//         idToken,
//       });

//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Google sign-in failed"
//       );
//     }
//   }
// );

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    userData: null,
    token: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.userData = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = true;
        state.userData = action.payload.user;
        state.token = action.payload.token;

        localStorage.setItem("token", action.payload.token);
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
