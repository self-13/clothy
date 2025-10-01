import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const initialState = {
  isLoading: false,
  orderId: null,
  orderList: [],
  orderDetails: null,
};

// ✅ Async Thunks (all directly exported)
export const createNewOrder = createAsyncThunk(
  "order/createNewOrder",
  async (orderData) => {
    const response = await axios.post(
      `${BASE_URL}/api/shop/order/create`,
      orderData
    );
    return response.data;
  }
);

export const capturePayment = createAsyncThunk(
  "order/capturePayment",
  async ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderData,
  }) => {
    const response = await axios.post(`${BASE_URL}/api/shop/order/capture`, {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData, // Add orderData to the request
    });
    return response.data;
  }
);

export const getAllOrdersByUserId = createAsyncThunk(
  "order/getAllOrdersByUserId",
  async (userId) => {
    const response = await axios.get(
      `${BASE_URL}/api/shop/order/list/${userId}`
    );
    return response.data;
  }
);

export const getOrderDetails = createAsyncThunk(
  "order/getOrderDetails",
  async (id) => {
    const response = await axios.get(
      `${BASE_URL}/api/shop/order/details/${id}`
    );
    return response.data;
  }
);

// ✅ New async thunks for cancellation and return
export const requestOrderCancellation = createAsyncThunk(
  "order/requestCancellation",
  async ({ orderId, reason }) => {
    const response = await axios.post(
      `${BASE_URL}/api/shop/order/${orderId}/cancel`,
      { reason }
    );
    return response.data;
  }
);

export const requestOrderReturn = createAsyncThunk(
  "order/requestReturn",
  async ({ orderId, reason }) => {
    const response = await axios.post(
      `${BASE_URL}/api/shop/order/${orderId}/return`,
      { reason }
    );
    return response.data;
  }
);

// ✅ Slice
const shoppingOrderSlice = createSlice({
  name: "shoppingOrder",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create New Order
      .addCase(createNewOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderId = action.payload.orderId;
        sessionStorage.setItem(
          "currentOrderId",
          JSON.stringify(action.payload.orderId)
        );
      })
      .addCase(createNewOrder.rejected, (state) => {
        state.isLoading = false;
        state.orderId = null;
      })

      // Get All Orders
      .addCase(getAllOrdersByUserId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrdersByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload.data;
      })
      .addCase(getAllOrdersByUserId.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [];
      })

      // Get Order Details
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload.data;
      })
      .addCase(getOrderDetails.rejected, (state) => {
        state.isLoading = false;
        state.orderDetails = null;
      })

      // Request Cancellation
      .addCase(requestOrderCancellation.fulfilled, (state, action) => {
        // Update the specific order in orderList
        const updatedOrder = action.payload.data;
        const orderIndex = state.orderList.findIndex(
          (order) => order._id === updatedOrder._id
        );
        if (orderIndex !== -1) {
          state.orderList[orderIndex] = updatedOrder;
        }
        // Also update orderDetails if it's the current order
        if (state.orderDetails && state.orderDetails._id === updatedOrder._id) {
          state.orderDetails = updatedOrder;
        }
      })

      // Request Return
      .addCase(requestOrderReturn.fulfilled, (state, action) => {
        // Update the specific order in orderList
        const updatedOrder = action.payload.data;
        const orderIndex = state.orderList.findIndex(
          (order) => order._id === updatedOrder._id
        );
        if (orderIndex !== -1) {
          state.orderList[orderIndex] = updatedOrder;
        }
        // Also update orderDetails if it's the current order
        if (state.orderDetails && state.orderDetails._id === updatedOrder._id) {
          state.orderDetails = updatedOrder;
        }
      });
  },
});

// ✅ Exports
export const { resetOrderDetails } = shoppingOrderSlice.actions;
export default shoppingOrderSlice.reducer;
