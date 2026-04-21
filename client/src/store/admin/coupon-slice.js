import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api";

const initialState = {
  isLoading: false,
  couponList: [],
};

export const addNewCoupon = createAsyncThunk(
  "/coupons/addnewcoupon",
  async (formData) => {
    const result = await api.post("/admin/coupons/add", formData);
    return result.data;
  }
);

export const fetchAllCoupons = createAsyncThunk(
  "/coupons/fetchallcoupons",
  async () => {
    const result = await api.get("/admin/coupons/get");
    return result.data;
  }
);

export const updateCoupon = createAsyncThunk(
  "/coupons/updatecoupon",
  async ({ id, formData }) => {
    const result = await api.put(`/admin/coupons/update/${id}`, formData);
    return result.data;
  }
);

export const deleteCoupon = createAsyncThunk(
  "/coupons/deletecoupon",
  async (id) => {
    const result = await api.delete(`/admin/coupons/delete/${id}`);
    return result.data;
  }
);

const adminCouponSlice = createSlice({
  name: "adminCoupons",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCoupons.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllCoupons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.couponList = action.payload.data;
      })
      .addCase(fetchAllCoupons.rejected, (state) => {
        state.isLoading = false;
        state.couponList = [];
      });
  },
});

export default adminCouponSlice.reducer;
