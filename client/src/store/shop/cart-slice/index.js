import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = import.meta.env.VITE_BASE_URL;

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
        userId,
        productId,
        quantity,
        selectedSize,
        selectedColor,
      });

      const response = await axios.post(`${BASE_URL}/api/shop/cart/add`, {
        userId,
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
      console.log("🔄 Fetching cart items for user:", userId);

      const response = await axios.get(
        `${BASE_URL}/api/shop/cart/get/${userId}`
      );
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
        userId,
        productId,
        selectedSize,
        selectedColor,
      });

      const response = await axios.delete(
        `${BASE_URL}/api/shop/cart/delete/${userId}/${productId}/${selectedSize}/${selectedColor}`
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
        userId,
        productId,
        quantity,
        selectedSize,
        selectedColor,
      });

      const response = await axios.put(`${BASE_URL}/api/shop/cart/update`, {
        userId,
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
      console.log("🔄 Clearing cart for user:", userId);

      const response = await axios.delete(
        `${BASE_URL}/api/shop/cart/clear/${userId}`
      );
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
