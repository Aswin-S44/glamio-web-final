import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../config/firebase";
import { completeGoogleAuth } from "../../services/auth.service";

export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (userType = "shop", { rejectWithValue }) => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      return await completeGoogleAuth({ idToken, userType });
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
