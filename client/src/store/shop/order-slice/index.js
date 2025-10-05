import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const initialState = {
  isLoading: false,
  orderId: null,
  orderList: [],
  orderDetails: null,
  error: null,
};

// Create New Order
export const createNewOrder = createAsyncThunk(
  "order/createNewOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      console.log("🔄 Creating new order:", orderData);

      const response = await axios.post(
        `${BASE_URL}/api/shop/order/create`,
        orderData
      );

      console.log("✅ Order created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error creating order:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Capture Payment
export const capturePayment = createAsyncThunk(
  "order/capturePayment",
  async (paymentData, { rejectWithValue }) => {
    try {
      console.log("🔄 Capturing payment:", paymentData);

      const response = await axios.post(
        `${BASE_URL}/api/shop/order/capture`,
        paymentData
      );

      console.log("✅ Payment captured successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error capturing payment:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get All Orders by User
export const getAllOrdersByUserId = createAsyncThunk(
  "order/getAllOrdersByUserId",
  async (userId, { rejectWithValue }) => {
    try {
      console.log("🔄 Fetching orders for user:", userId);

      const response = await axios.get(
        `${BASE_URL}/api/shop/order/list/${userId}`
      );

      console.log(
        "✅ Orders fetched successfully:",
        response.data.data?.length
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get Order Details
export const getOrderDetails = createAsyncThunk(
  "order/getOrderDetails",
  async (id, { rejectWithValue }) => {
    try {
      console.log("🔄 Fetching order details:", id);

      const response = await axios.get(
        `${BASE_URL}/api/shop/order/details/${id}`
      );

      console.log("✅ Order details fetched successfully");
      // Extract order from nested structure if needed
      const orderData = response.data.data?.order || response.data.data;
      return { data: orderData };
    } catch (error) {
      console.error("❌ Error fetching order details:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Request Order Cancellation
export const requestOrderCancellation = createAsyncThunk(
  "order/requestCancellation",
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      console.log("🔄 Requesting cancellation for order:", orderId);

      const response = await axios.post(
        `${BASE_URL}/api/shop/order/${orderId}/cancel`,
        { reason }
      );

      console.log("✅ Cancellation requested successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error requesting cancellation:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Request Order Return
export const requestOrderReturn = createAsyncThunk(
  "order/requestReturn",
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      console.log("🔄 Requesting return for order:", orderId);

      const response = await axios.post(
        `${BASE_URL}/api/shop/order/${orderId}/return`,
        { reason }
      );

      console.log("✅ Return requested successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error requesting return:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Track Order
export const trackOrder = createAsyncThunk(
  "order/trackOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      console.log("🔄 Tracking order:", orderId);

      const response = await axios.get(
        `${BASE_URL}/api/shop/order/track/${orderId}`
      );

      console.log("✅ Order tracking fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error tracking order:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const shoppingOrderSlice = createSlice({
  name: "shoppingOrder",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
      state.error = null;
    },
    clearOrderError: (state) => {
      state.error = null;
    },
    resetOrderState: (state) => {
      state.orderId = null;
      state.orderList = [];
      state.orderDetails = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create New Order
      .addCase(createNewOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderId = action.payload.orderId;
        state.error = null;
      })
      .addCase(createNewOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.orderId = null;
        state.error = action.payload || "Failed to create order";
      })
      // Get All Orders
      .addCase(getAllOrdersByUserId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllOrdersByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload.data || [];
        state.error = null;
      })
      .addCase(getAllOrdersByUserId.rejected, (state, action) => {
        state.isLoading = false;
        state.orderList = [];
        state.error = action.payload || "Failed to fetch orders";
      })
      // Get Order Details
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload.data;
        state.error = null;
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.orderDetails = null;
        state.error = action.payload || "Failed to fetch order details";
      })
      // Request Cancellation
      .addCase(requestOrderCancellation.fulfilled, (state, action) => {
        const updatedOrder = action.payload.data;
        // Update order in orderList
        const orderIndex = state.orderList.findIndex(
          (order) => order._id === updatedOrder._id
        );
        if (orderIndex !== -1) {
          state.orderList[orderIndex] = updatedOrder;
        }
        // Update orderDetails if it's the current order
        if (state.orderDetails && state.orderDetails._id === updatedOrder._id) {
          state.orderDetails = updatedOrder;
        }
      })
      // Request Return
      .addCase(requestOrderReturn.fulfilled, (state, action) => {
        const updatedOrder = action.payload.data;
        // Update order in orderList
        const orderIndex = state.orderList.findIndex(
          (order) => order._id === updatedOrder._id
        );
        if (orderIndex !== -1) {
          state.orderList[orderIndex] = updatedOrder;
        }
        // Update orderDetails if it's the current order
        if (state.orderDetails && state.orderDetails._id === updatedOrder._id) {
          state.orderDetails = updatedOrder;
        }
      });
  },
});

export const { resetOrderDetails, clearOrderError, resetOrderState } =
  shoppingOrderSlice.actions;
export default shoppingOrderSlice.reducer;
