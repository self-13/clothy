import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const initialState = {
  orderList: [],
  orderDetails: null,
  cancellationRequests: [],
  returnRequests: [],
  pendingRequests: null,
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

// const adminOrderSlice = createSlice({
//   name: "adminOrder",
//   initialState,
//   reducers: {
//     resetOrderDetails: (state) => {
//       state.orderDetails = null;
//     },
//     clearOrders: (state) => {
//       state.orderList = [];
//       state.orderDetails = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Get all orders
//       .addCase(getAllOrdersForAdmin.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(getAllOrdersForAdmin.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.orderList = action.payload.data || [];
//       })
//       .addCase(getAllOrdersForAdmin.rejected, (state) => {
//         state.isLoading = false;
//         state.orderList = [];
//       })
//       // Get order details
//       .addCase(getOrderDetailsForAdmin.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(getOrderDetailsForAdmin.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.orderDetails = action.payload.data;
//       })
//       .addCase(getOrderDetailsForAdmin.rejected, (state) => {
//         state.isLoading = false;
//         state.orderDetails = null;
//       })
//       // Update order status
//       .addCase(updateOrderStatus.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(updateOrderStatus.fulfilled, (state, action) => {
//         state.isLoading = false;
//         // Update the order in the list if it exists
//         if (action.payload.success && action.payload.data) {
//           const updatedOrder = action.payload.data;
//           const index = state.orderList.findIndex(
//             (order) => order._id === updatedOrder._id
//           );
//           if (index !== -1) {
//             state.orderList[index] = updatedOrder;
//           }
//           // Also update order details if it's currently being viewed
//           if (
//             state.orderDetails &&
//             state.orderDetails._id === updatedOrder._id
//           ) {
//             state.orderDetails = updatedOrder;
//           }
//         }
//       })
//       .addCase(updateOrderStatus.rejected, (state) => {
//         state.isLoading = false;
//       });
//   },
// });

// ✅ New thunks for cancellation and return management
export const getCancellationRequests = createAsyncThunk(
  "adminOrders/getCancellationRequests",
  async (_, { rejectWithValue }) => {
    try {
      const userId = getUserId();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      console.log("🔄 Fetching cancellation requests");

      const response = await axios.get(
        `${BASE_URL}/api/admin/orders/cancellation-requests`,
        {
          headers: {
            "x-user-id": userId,
          },
        }
      );

      console.log(
        "✅ Cancellation requests fetched:",
        response.data.data?.length
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching cancellation requests:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getReturnRequests = createAsyncThunk(
  "adminOrders/getReturnRequests",
  async (_, { rejectWithValue }) => {
    try {
      const userId = getUserId();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      console.log("🔄 Fetching return requests");

      const response = await axios.get(
        `${BASE_URL}/api/admin/orders/return-requests`,
        {
          headers: {
            "x-user-id": userId,
          },
        }
      );

      console.log("✅ Return requests fetched:", response.data.data?.length);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching return requests:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getPendingRequests = createAsyncThunk(
  "adminOrders/getPendingRequests",
  async (_, { rejectWithValue }) => {
    try {
      const userId = getUserId();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      console.log("🔄 Fetching pending requests");

      const response = await axios.get(
        `${BASE_URL}/api/admin/orders/pending-requests`,
        {
          headers: {
            "x-user-id": userId,
          },
        }
      );

      console.log("✅ Pending requests fetched");
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching pending requests:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCancellationStatus = createAsyncThunk(
  "adminOrders/updateCancellationStatus",
  async ({ id, status, refundAmount, adminNotes }, { rejectWithValue }) => {
    try {
      const userId = getUserId();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      console.log("🔄 Updating cancellation status:", { id, status });

      const response = await axios.put(
        `${BASE_URL}/api/admin/orders/${id}/cancellation-status`,
        { status, refundAmount, adminNotes },
        {
          headers: {
            "x-user-id": userId,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Cancellation status updated:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error updating cancellation status:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateReturnStatus = createAsyncThunk(
  "adminOrders/updateReturnStatus",
  async (
    { id, status, refundAmount, pickupAddress, adminNotes },
    { rejectWithValue }
  ) => {
    try {
      const userId = getUserId();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      console.log("🔄 Updating return status:", { id, status });

      const response = await axios.put(
        `${BASE_URL}/api/admin/orders/${id}/return-status`,
        { status, refundAmount, pickupAddress, adminNotes },
        {
          headers: {
            "x-user-id": userId,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Return status updated:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error updating return status:", error);
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
    resetRequests: (state) => {
      state.cancellationRequests = [];
      state.returnRequests = [];
      state.pendingRequests = null;
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
      })
      // Get cancellation requests
      .addCase(getCancellationRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCancellationRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cancellationRequests = action.payload.data || [];
      })
      .addCase(getCancellationRequests.rejected, (state) => {
        state.isLoading = false;
        state.cancellationRequests = [];
      })
      // Get return requests
      .addCase(getReturnRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getReturnRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.returnRequests = action.payload.data || [];
      })
      .addCase(getReturnRequests.rejected, (state) => {
        state.isLoading = false;
        state.returnRequests = [];
      })
      // Get pending requests
      .addCase(getPendingRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPendingRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingRequests = action.payload.data;
      })
      .addCase(getPendingRequests.rejected, (state) => {
        state.isLoading = false;
        state.pendingRequests = null;
      })
      // Update cancellation status
      .addCase(updateCancellationStatus.fulfilled, (state, action) => {
        if (action.payload.success && action.payload.data) {
          const updatedOrder = action.payload.data;
          // Update in cancellation requests
          const cancellationIndex = state.cancellationRequests.findIndex(
            (order) => order._id === updatedOrder._id
          );
          if (cancellationIndex !== -1) {
            state.cancellationRequests[cancellationIndex] = updatedOrder;
          }
          // Update in order list
          const orderIndex = state.orderList.findIndex(
            (order) => order._id === updatedOrder._id
          );
          if (orderIndex !== -1) {
            state.orderList[orderIndex] = updatedOrder;
          }
        }
      })
      // Update return status
      .addCase(updateReturnStatus.fulfilled, (state, action) => {
        if (action.payload.success && action.payload.data) {
          const updatedOrder = action.payload.data;
          // Update in return requests
          const returnIndex = state.returnRequests.findIndex(
            (order) => order._id === updatedOrder._id
          );
          if (returnIndex !== -1) {
            state.returnRequests[returnIndex] = updatedOrder;
          }
          // Update in order list
          const orderIndex = state.orderList.findIndex(
            (order) => order._id === updatedOrder._id
          );
          if (orderIndex !== -1) {
            state.orderList[orderIndex] = updatedOrder;
          }
        }
      });
  },
});

export const { resetOrderDetails, clearOrders, resetRequests } =
  adminOrderSlice.actions;
export default adminOrderSlice.reducer;
