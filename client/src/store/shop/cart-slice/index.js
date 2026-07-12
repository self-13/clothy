import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";
// const BASE_URL = import.meta.env.VITE_BASE_URL; // Not needed with api instance

const initialState = {
  cartItems: { items: [], summary: {} },
  isLoading: false,
  error: null,
};

const calculateCartSummary = (items) => {
  return items.reduce(
    (summary, item) => {
      const price = item.salePrice > 0 && item.salePrice < item.price ? item.salePrice : item.price;
      const total = price * item.quantity;
      return {
        totalItems: summary.totalItems + item.quantity,
        subtotal: summary.subtotal + total,
        totalDiscount:
          summary.totalDiscount +
          (item.salePrice > 0 && item.salePrice < item.price
            ? (item.price - item.salePrice) * item.quantity
            : 0),
        estimatedTotal: summary.estimatedTotal + total,
      };
    },
    { totalItems: 0, subtotal: 0, totalDiscount: 0, estimatedTotal: 0 }
  );
};

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (
    { userId, productId, quantity, selectedSize, selectedColor },
    { rejectWithValue, getState }
  ) => {
    try {
      console.log("🔄 Adding to cart:", {
        productId,
        quantity,
        selectedSize,
        selectedColor,
      });

      const state = getState();
      const isAuthenticated = state.auth.isAuthenticated;

      if (!isAuthenticated) {
        // Fetch product details for guest cart population
        const response = await api.get(`/shop/products/get/${productId}`);
        const product = response.data.data?.product || response.data.data;
        if (!product) {
          throw new Error("Product details not found");
        }

        let guestCart = { items: [], summary: {} };
        const storedCart = localStorage.getItem("guestCart");
        if (storedCart) {
          try {
            guestCart = JSON.parse(storedCart);
          } catch (e) {
            console.error("Error parsing guest cart:", e);
          }
        }
        if (!guestCart.items) guestCart.items = [];

        const existingItemIndex = guestCart.items.findIndex(
          (item) =>
            item.productId === productId &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
        );

        const selectedSizeStock = product.sizes?.find((s) => s.size === selectedSize);
        const availableStock = selectedSizeStock ? selectedSizeStock.stock : 0;

        if (existingItemIndex > -1) {
          const newQty = guestCart.items[existingItemIndex].quantity + quantity;
          if (newQty > availableStock) {
            throw new Error(`Only ${availableStock} items available`);
          }
          guestCart.items[existingItemIndex].quantity = newQty;
        } else {
          if (quantity > availableStock) {
            throw new Error(`Only ${availableStock} items available`);
          }
          guestCart.items.push({
            productId: product._id,
            title: product.title,
            images: product.images,
            price: product.price,
            salePrice: product.salePrice,
            brand: product.brand,
            quantity: quantity,
            selectedSize: selectedSize,
            selectedColor: selectedColor,
            availableSizes: product.sizes,
            availableColors: product.colors,
            averageReview: product.averageReview,
            stock: availableStock,
            isAvailable: true,
          });
        }

        guestCart.summary = calculateCartSummary(guestCart.items);
        localStorage.setItem("guestCart", JSON.stringify(guestCart));

        console.log("✅ Guest cart updated successfully:", guestCart);
        return { success: true, data: guestCart };
      }

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
      return rejectWithValue(
        error.response?.data || { success: false, message: error.message }
      );
    }
  }
);

export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (userId, { rejectWithValue, getState }) => {
    try {
      console.log("🔄 Fetching cart items");

      const state = getState();
      const isAuthenticated = state.auth.isAuthenticated;

      if (!isAuthenticated) {
        let guestCart = { items: [], summary: {} };
        const storedCart = localStorage.getItem("guestCart");
        if (storedCart) {
          try {
            guestCart = JSON.parse(storedCart);
          } catch (e) {
            console.error("Error parsing guest cart:", e);
          }
        }
        if (!guestCart.items) guestCart.items = [];
        guestCart.summary = calculateCartSummary(guestCart.items);
        console.log("✅ Guest cart items fetched:", guestCart);
        return { success: true, data: guestCart };
      }

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
    { rejectWithValue, getState }
  ) => {
    try {
      console.log("🔄 Deleting cart item:", {
        productId,
        selectedSize,
        selectedColor,
      });

      const state = getState();
      const isAuthenticated = state.auth.isAuthenticated;

      if (!isAuthenticated) {
        let guestCart = { items: [], summary: {} };
        const storedCart = localStorage.getItem("guestCart");
        if (storedCart) {
          try {
            guestCart = JSON.parse(storedCart);
          } catch (e) {
            console.error("Error parsing guest cart:", e);
          }
        }
        if (!guestCart.items) guestCart.items = [];

        guestCart.items = guestCart.items.filter(
          (item) =>
            !(
              item.productId === productId &&
              item.selectedSize === selectedSize &&
              item.selectedColor === selectedColor
            )
        );

        guestCart.summary = calculateCartSummary(guestCart.items);
        localStorage.setItem("guestCart", JSON.stringify(guestCart));

        console.log("✅ Guest cart item deleted:", guestCart);
        return { success: true, data: guestCart };
      }

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
    { rejectWithValue, getState }
  ) => {
    try {
      console.log("🔄 Updating cart quantity:", {
        productId,
        quantity,
        selectedSize,
        selectedColor,
      });

      const state = getState();
      const isAuthenticated = state.auth.isAuthenticated;

      if (!isAuthenticated) {
        let guestCart = { items: [], summary: {} };
        const storedCart = localStorage.getItem("guestCart");
        if (storedCart) {
          try {
            guestCart = JSON.parse(storedCart);
          } catch (e) {
            console.error("Error parsing guest cart:", e);
          }
        }
        if (!guestCart.items) guestCart.items = [];

        const existingItemIndex = guestCart.items.findIndex(
          (item) =>
            item.productId === productId &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
        );

        if (existingItemIndex > -1) {
          const item = guestCart.items[existingItemIndex];
          const selectedSizeStock = item.availableSizes?.find((s) => s.size === selectedSize);
          const availableStock = selectedSizeStock ? selectedSizeStock.stock : 0;

          if (quantity > availableStock) {
            throw new Error(`Only ${availableStock} items available`);
          }
          guestCart.items[existingItemIndex].quantity = quantity;
        }

        guestCart.summary = calculateCartSummary(guestCart.items);
        localStorage.setItem("guestCart", JSON.stringify(guestCart));

        console.log("✅ Guest cart quantity updated:", guestCart);
        return { success: true, data: guestCart };
      }

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
      return rejectWithValue(
        error.response?.data || { success: false, message: error.message }
      );
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (userId, { rejectWithValue, getState }) => {
    try {
      console.log("🔄 Clearing cart");

      const state = getState();
      const isAuthenticated = state.auth.isAuthenticated;

      if (!isAuthenticated) {
        localStorage.removeItem("guestCart");
        return {
          success: true,
          data: {
            items: [],
            summary: { totalItems: 0, subtotal: 0, totalDiscount: 0, estimatedTotal: 0 },
          },
        };
      }

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
