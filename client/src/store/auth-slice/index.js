import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import api from "../../api"; // Using centralized api instance for consistent config

const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;

let parsedUser = null;
try {
  parsedUser = storedUser ? JSON.parse(storedUser) : null;
} catch {
  parsedUser = null;
}

const initialState = {
  isAuthenticated: !!parsedUser,
  isLoading: true,
  user: parsedUser,
  token: storedToken || null,
};

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const registerUser = createAsyncThunk(
  "/auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || {
        success: false,
        message: "Registration failed"
      });
    }
  }
);

export const loginUser = createAsyncThunk(
  "/auth/login",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || {
        success: false,
        message: "Login failed"
      });
    }
  }
);

export const logoutUser = createAsyncThunk(
  "/auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/logout", {});
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || {
        success: false,
        message: "Logout failed"
      });
    }
  }
);

export const checkAuth = createAsyncThunk(
  "/auth/checkauth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/check-auth");
      return response.data;
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status,
        data: error.response?.data,
        message:
          error.response?.data?.message ||
          error.message ||
          "Authentication check failed",
      });
    }
  }
);

export const verifyOTP = createAsyncThunk(
  "/auth/verify-otp",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/verify-otp", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || {
        success: false,
        message: "OTP verification failed"
      });
    }
  }
);

export const resendOTP = createAsyncThunk(
  "/auth/resend-otp",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/resend-otp", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || {
        success: false,
        message: "Failed to resend OTP"
      });
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "/auth/forgot-password",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/forgot-password", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || {
        success: false,
        message: "Failed to send reset email"
      });
    }
  }
);

export const resetPassword = createAsyncThunk(
  "/auth/reset-password",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/reset-password", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || {
        success: false,
        message: "Password reset failed"
      });
    }
  }
);

export const updateProfile = createAsyncThunk(
  "/auth/updateprofile",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.put("/auth/update-profile", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || {
        success: false,
        message: "Profile update failed"
      });
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    restoreSession: (state) => {
      const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (storedUser) {
        try {
          state.user = JSON.parse(storedUser);
          state.token = storedToken || null;
          state.isAuthenticated = true;
        } catch {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
      } else {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.token = action.payload.token || null;
        state.isAuthenticated = action.payload.success;
        if (action.payload.success && action.payload.user) {
          localStorage.setItem("user", JSON.stringify(action.payload.user));
          if (action.payload.token) {
            localStorage.setItem("token", action.payload.token);
          }
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
        if (action.payload.token) {
          state.token = action.payload.token;
          localStorage.setItem("token", action.payload.token);
        }
        if (action.payload.success && action.payload.user) {
          localStorage.setItem("user", JSON.stringify(action.payload.user));
        } else {
          state.token = null;
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
        const status = action.payload?.status;

        // ONLY wipe credentials if the server explicitly confirmed 401 Unauthorized
        if (status === 401) {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        } else {
          // If network glitch, server wake-up/timeout, or 5xx, preserve restored session!
          const storedUser = localStorage.getItem("user");
          const storedToken = localStorage.getItem("token");
          if (storedUser) {
            try {
              state.user = JSON.parse(storedUser);
              state.token = storedToken || null;
              state.isAuthenticated = true;
            } catch {
              state.user = null;
              state.token = null;
              state.isAuthenticated = false;
            }
          }
        }
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      })
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
      })
      .addCase(resendOTP.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resendOTP.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.isLoading = false;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
      })
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
      })
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : state.user;
        if (action.payload.token) {
          state.token = action.payload.token;
          localStorage.setItem("token", action.payload.token);
        }
        if (action.payload.success && action.payload.user) {
          localStorage.setItem("user", JSON.stringify(action.payload.user));
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
      });
  },
});

export const { setUser, restoreSession } = authSlice.actions;
export default authSlice.reducer;
