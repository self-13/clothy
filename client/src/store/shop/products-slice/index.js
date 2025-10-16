import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const initialState = {
  isLoading: false,
  productList: [],
  productDetails: null,
  error: null,
};

export const fetchAllFilteredProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async (
    { filterParams = {}, sortParams = "most-selling" },
    { rejectWithValue }
  ) => {
    try {
      console.log("🔄 Fetching filtered products with:", {
        filterParams,
        sortParams,
      });

      const queryParams = new URLSearchParams({
        ...filterParams,
        sortBy: sortParams,
      });

      if (!queryParams.has("page")) queryParams.set("page", "1");
      if (!queryParams.has("limit")) queryParams.set("limit", "100");

      const response = await axios.get(
        `${BASE_URL}/api/shop/products/get?${queryParams}`
      );

      console.log(
        "✅ Products fetched successfully:",
        response.data.data?.length
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  "/products/fetchProductDetails",
  async (id, { rejectWithValue }) => {
    try {
      console.log("🔄 Fetching product details for ID:", id);

      const response = await axios.get(
        `${BASE_URL}/api/shop/products/get/${id}`
      );

      console.log("✅ Product details fetched successfully:", response.data);

      // Extract the product from the nested structure
      const productData = response.data.data?.product || response.data.data;
      console.log("📦 Extracted product data:", productData);

      return { data: productData };
    } catch (error) {
      console.error("❌ Error fetching product details:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const shoppingProductSlice = createSlice({
  name: "shoppingProducts",
  initialState,
  reducers: {
    resetProductDetails: (state) => {
      state.productDetails = null;
      state.error = null;
    },
    clearProductList: (state) => {
      state.productList = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all products
      .addCase(fetchAllFilteredProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllFilteredProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle both array and object responses
        state.productList = Array.isArray(action.payload.data)
          ? action.payload.data
          : action.payload.data?.products || [];
        state.error = null;
      })
      .addCase(fetchAllFilteredProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.productList = [];
        state.error = action.payload || "Failed to fetch products";
      })
      // Fetch product details
      .addCase(fetchProductDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productDetails = action.payload.data;
        state.error = null;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.productDetails = null;
        state.error = action.payload || "Failed to fetch product details";
      });
  },
});

export const { resetProductDetails, clearProductList, clearError } =
  shoppingProductSlice.actions;

export default shoppingProductSlice.reducer;
