import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const initialState = {
  orderList: [],
  orderDetails: null,
  isLoading: false,
};

// Helper function to get user ID from localStorage
const getUserId = () => {
  const user = localStorage.getItem("user");
  if (!user) return null;
  try {
    return JSON.parse(user).id;
  } catch (error) {
    console.error("Error parsing user from localStorage", error);
    return null;
  }
};

export const getAllOrdersForAdmin = createAsyncThunk(
  "adminOrders/getAllOrdersForAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const userId = getUserId();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      console.log("🔄 Fetching all orders for admin");

      const response = await axios.get(`${BASE_URL}/api/admin/orders/get`, {
        headers: {
          "x-user-id": userId,
        },
      });

      console.log("✅ Orders fetched:", response.data.data?.length);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getOrderDetailsForAdmin = createAsyncThunk(
  "adminOrders/getOrderDetailsForAdmin",
  async (orderId, { rejectWithValue }) => {
    try {
      const userId = getUserId();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      console.log("🔄 Fetching order details:", orderId);

      const response = await axios.get(
        `${BASE_URL}/api/admin/orders/details/${orderId}`,
        {
          headers: {
            "x-user-id": userId,
          },
        }
      );

      console.log("✅ Order details fetched");
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching order details:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "adminOrders/updateOrderStatus",
  async ({ id, orderStatus }, { rejectWithValue }) => {
    try {
      const userId = getUserId();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      console.log("🔄 Updating order status:", { id, orderStatus });

      const response = await axios.put(
        `${BASE_URL}/api/admin/orders/update/${id}`,
        { orderStatus },
        {
          headers: {
            "x-user-id": userId,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Order status updated:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error updating order status:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const adminOrderSlice = createSlice({
  name: "adminOrder",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
    },
    clearOrders: (state) => {
      state.orderList = [];
      state.orderDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all orders
      .addCase(getAllOrdersForAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrdersForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload.data || [];
      })
      .addCase(getAllOrdersForAdmin.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [];
      })
      // Get order details
      .addCase(getOrderDetailsForAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetailsForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload.data;
      })
      .addCase(getOrderDetailsForAdmin.rejected, (state) => {
        state.isLoading = false;
        state.orderDetails = null;
      })
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the order in the list if it exists
        if (action.payload.success && action.payload.data) {
          const updatedOrder = action.payload.data;
          const index = state.orderList.findIndex(
            (order) => order._id === updatedOrder._id
          );
          if (index !== -1) {
            state.orderList[index] = updatedOrder;
          }
          // Also update order details if it's currently being viewed
          if (
            state.orderDetails &&
            state.orderDetails._id === updatedOrder._id
          ) {
            state.orderDetails = updatedOrder;
          }
        }
      })
      .addCase(updateOrderStatus.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { resetOrderDetails, clearOrders } = adminOrderSlice.actions;
export default adminOrderSlice.reducer;
