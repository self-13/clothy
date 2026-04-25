import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api";

const initialState = {
  isLoading: false,
  appliedCoupon: null,
  error: null,
};

export const validateCoupon = createAsyncThunk(
  "/shop/validatecoupon",
  async ({ code, orderAmount }, { rejectWithValue }) => {
    try {
      const result = await api.post("/admin/coupons/validate", { code, orderAmount });
      return result.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || {
        success: false,
        message: "Failed to validate coupon"
      });
    }
  }
);

const shopCouponSlice = createSlice({
  name: "shopCoupons",
  initialState,
  reducers: {
    clearCoupon: (state) => {
      state.appliedCoupon = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(validateCoupon.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appliedCoupon = action.payload.data;
        state.error = null;
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.isLoading = false;
        state.appliedCoupon = null;
        state.error = action.payload?.message || "Invalid coupon";
      });
  },
});

export const { clearCoupon } = shopCouponSlice.actions;
export default shopCouponSlice.reducer;
