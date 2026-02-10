import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";
// const BASE_URL = import.meta.env.VITE_BASE_URL; // Not needed with api instance

const initialState = {
  cartItems: { items: [], summary: {} },
  isLoading: false,
  error: null,
};

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (
    { userId, productId, quantity, selectedSize, selectedColor },
    { rejectWithValue }
  ) => {
    try {
      console.log("🔄 Adding to cart:", {
        productId,
        quantity,
        selectedSize,
        selectedColor,
      });

      const response = await api.post("/shop/cart/add", {
        productId,
        quantity,
        selectedSize,
        selectedColor,
      });

      console.log("✅ Added to cart successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error adding to cart:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (userId, { rejectWithValue }) => {
    try {
      console.log("🔄 Fetching cart items");

      const response = await api.get("/shop/cart/get");
      console.log("✅ Cart items fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching cart items:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async (
    { userId, productId, selectedSize, selectedColor },
    { rejectWithValue }
  ) => {
    try {
      console.log("🔄 Deleting cart item:", {
        productId,
        selectedSize,
        selectedColor,
      });

      const response = await api.delete(
        `/shop/cart/delete/${productId}/${selectedSize}/${selectedColor}`
      );
      console.log("✅ Cart item deleted:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error deleting cart item:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async (
    { userId, productId, quantity, selectedSize, selectedColor },
    { rejectWithValue }
  ) => {
    try {
      console.log("🔄 Updating cart quantity:", {
        productId,
        quantity,
        selectedSize,
        selectedColor,
      });

      const response = await api.put("/shop/cart/update", {
        productId,
        quantity,
        selectedSize,
        selectedColor,
      });
      console.log("✅ Cart quantity updated:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error updating cart quantity:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (userId, { rejectWithValue }) => {
    try {
      console.log("🔄 Clearing cart");

      const response = await api.delete("/shop/cart/clear");
      console.log("✅ Cart cleared:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error clearing cart:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const shoppingCartSlice = createSlice({
  name: "shoppingCart",
  initialState,
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
    resetCart: (state) => {
      state.cartItems = { items: [], summary: {} };
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data || { items: [], summary: {} };
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to add item to cart";
      })
      // Fetch cart items
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data || { items: [], summary: {} };
        state.error = null;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.isLoading = false;
        state.cartItems = { items: [], summary: {} };
        state.error = action.payload || "Failed to fetch cart items";
      })
      // Update cart quantity
      .addCase(updateCartQuantity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data || { items: [], summary: {} };
        state.error = null;
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update cart quantity";
      })
      // Delete cart item
      .addCase(deleteCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data || { items: [], summary: {} };
        state.error = null;
      })
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete cart item";
      })
      // Clear cart
      .addCase(clearCart.fulfilled, (state, action) => {
        state.cartItems = action.payload.data || { items: [], summary: {} };
        state.error = null;
      });
  },
});

export const { clearCartError, resetCart } = shoppingCartSlice.actions;
export default shoppingCartSlice.reducer;
