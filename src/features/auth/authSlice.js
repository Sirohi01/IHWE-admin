import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import API from "../../middleware/axiosConfig";

// const API_URL = "http://localhost:5000/api";
// Base API URL (.env file se)
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// 🟢 Login → OTP generate
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ user_name, user_password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/login`,
        { user_name, user_password },
        { withCredentials: true }, // cookie handling if needed
      );

      // Save username for resend OTP
      // sessionStorage.setItem("user_name", user_name);

      // sessionStorage use karo
      sessionStorage.setItem("user_name", user_name);
      sessionStorage.setItem("user_id", response.data.user_id);

      return response.data; // { message, otp, user_name } will come
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// 🟢 Verify OTP
export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async ({ otp }, { rejectWithValue }) => {
    try {
      const user_id = sessionStorage.getItem("user_id");

      if (!user_id) {
        throw new Error("Session expired. Please login again.");
      }

      const response = await API.post("/verify-otp", {
        user_id,
        otp,
      });

      // token + user session me store
      sessionStorage.setItem("token", response.data.token);
      sessionStorage.setItem("user", JSON.stringify(response.data.user));

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// 🟢 Resend OTP → only username needed
export const resendOTP = createAsyncThunk(
  "auth/resendOTP",
  async (_, { rejectWithValue }) => {
    try {
      const user_id = sessionStorage.getItem("user_id");

      if (!user_id) throw new Error("Session expired. Please login again.");

      const response = await axios.post(`${BASE_URL}/resend-otp`, {
        user_id,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// 4. Logout Thunk (Clears server-side httpOnly cookie)
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Server-side call to clear the 'token' httpOnly cookie
      const response = await API.post("/logout", {});

      // Success hone par, local state clear karne ke liye 'logout' action ko dispatch karein
      dispatch(logout());

      return response.data;
    } catch (error) {
      // Agar server call fail bhi ho, tab bhi client-side ko logout kar dein (UX)
      console.error(
        "Logout API failed, forcing client-side logout:",
        error.message,
      );
      dispatch(logout());

      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

const initialState = {
  loading: false,
  error: null,
  isAuthenticated: false,
  otpSent: false,
  resentOTP: null, // store last resent OTP for testing (optional)
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.loading = false;
      state.error = null;
      state.isAuthenticated = false;
      state.otpSent = false;

      sessionStorage.removeItem("user_name");
      sessionStorage.removeItem("user_id");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Resend OTP
      .addCase(resendOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.resentOTP = action.payload.otp; // optional for testing
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // --- Logout User ---
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // logoutUser.fulfilled case ki zarurat nahi hai, kyunki 'logout' reducer thunk me hi call ho raha hai.
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        // Local state clear ho chuka hai (dispatch(logout()) ke karan), sirf error log kar sakte hain.
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
