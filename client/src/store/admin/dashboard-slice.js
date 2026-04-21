import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api";

const initialState = {
  isLoading: false,
  stats: {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    lowStockAlerts: [],
    recentOrders: [],
    salesData: [],
  },
};

export const getDashboardStats = createAsyncThunk(
  "/dashboard/getstats",
  async () => {
    const result = await api.get("/admin/dashboard/stats");
    return result.data;
  }
);

const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.data;
      })
      .addCase(getDashboardStats.rejected, (state) => {
        state.isLoading = false;
        state.stats = {
          totalRevenue: 0,
          totalOrders: 0,
          totalProducts: 0,
          totalUsers: 0,
          lowStockAlerts: [],
          recentOrders: [],
          salesData: [],
        };
      });
  },
});

export default adminDashboardSlice.reducer;
