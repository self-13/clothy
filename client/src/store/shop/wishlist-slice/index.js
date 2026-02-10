import api from "../../../api";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// const BASE_URL = import.meta.env.VITE_BASE_URL;

const initialState = {
  wishlistItems: [],
  isLoading: false,
};

export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async ({ productId }) => {
    const response = await api.post("/shop/wishlist/add", {
      productId,
    });
    return response.data;
  }
);

export const fetchWishlistItems = createAsyncThunk(
  "wishlist/fetchWishlistItems",
  async () => {
    const response = await api.get("/shop/wishlist/get");
    return response.data;
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async ({ productId }) => {
    const response = await api.delete(`/shop/wishlist/remove/${productId}`);
    return response.data;
  }
);

export const checkProductInWishlist = createAsyncThunk(
  "wishlist/checkProductInWishlist",
  async ({ productId }) => {
    const response = await api.get(`/shop/wishlist/check/${productId}`);
    return response.data;
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.wishlistItems = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToWishlist.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wishlistItems = action.payload.data;
      })
      .addCase(addToWishlist.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchWishlistItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchWishlistItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wishlistItems = action.payload.data;
      })
      .addCase(fetchWishlistItems.rejected, (state) => {
        state.isLoading = false;
        state.wishlistItems = [];
      })
      .addCase(removeFromWishlist.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wishlistItems = action.payload.data;
      })
      .addCase(removeFromWishlist.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(checkProductInWishlist.fulfilled, (state, action) => {
        // This is handled in component level, no need to update state
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
