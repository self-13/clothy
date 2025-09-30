import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  productList: [],
};

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Helper to get userId from localStorage
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

// Add new product
export const addNewProduct = createAsyncThunk(
  "adminProducts/addNewProduct",
  async (formData, { rejectWithValue }) => {
    try {
      const userId = getUserId();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      console.log("🔄 Adding new product:", formData);

      const response = await axios.post(
        `${BASE_URL}/api/admin/products/add`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
          },
        }
      );

      console.log("✅ Product added response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error adding product:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch all products
export const fetchAllProducts = createAsyncThunk(
  "adminProducts/fetchAllProducts",
  async (_, { rejectWithValue }) => {
    try {
      const userId = getUserId();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const response = await axios.get(
        `${BASE_URL}/api/admin/products/fetch-all`,
        {
          headers: { "x-user-id": userId },
        }
      );

      console.log("✅ Fetched products:", response.data.data?.length);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Edit product
export const editProduct = createAsyncThunk(
  "adminProducts/editProduct",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const userId = getUserId();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      console.log("🔄 Editing product:", id, formData);

      const response = await axios.put(
        `${BASE_URL}/api/admin/products/edit/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
          },
        }
      );

      console.log("✅ Product edited response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error editing product:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete product
export const deleteProduct = createAsyncThunk(
  "adminProducts/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      const userId = getUserId();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const response = await axios.delete(
        `${BASE_URL}/api/admin/products/delete/${id}`,
        {
          headers: { "x-user-id": userId },
        }
      );

      console.log("✅ Product deleted response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error deleting product:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Add size to product
export const addSizeToProduct = createAsyncThunk(
  "adminProducts/addSizeToProduct",
  async ({ productId, size, stock }, { rejectWithValue }) => {
    try {
      const userId = getUserId();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const response = await axios.post(
        `${BASE_URL}/api/admin/products/${productId}/sizes`,
        { size, stock },
        {
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update size stock
export const updateSizeStock = createAsyncThunk(
  "adminProducts/updateSizeStock",
  async ({ productId, sizeId, stock }, { rejectWithValue }) => {
    try {
      const userId = getUserId();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const response = await axios.put(
        `${BASE_URL}/api/admin/products/${productId}/sizes/${sizeId}`,
        { stock },
        {
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Remove size from product
export const removeSizeFromProduct = createAsyncThunk(
  "adminProducts/removeSizeFromProduct",
  async ({ productId, sizeId }, { rejectWithValue }) => {
    try {
      const userId = getUserId();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const response = await axios.delete(
        `${BASE_URL}/api/admin/products/${productId}/sizes/${sizeId}`,
        {
          headers: { "x-user-id": userId },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const AdminProductsSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {
    updateProductSizesLocally: (state, action) => {
      const { productId, sizes } = action.payload;
      const product = state.productList.find((item) => item._id === productId);
      if (product) product.sizes = sizes;
    },
    clearProducts: (state) => {
      state.productList = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all products
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data || [];
      })
      .addCase(fetchAllProducts.rejected, (state) => {
        state.isLoading = false;
        state.productList = [];
      })

      // Add new product
      .addCase(addNewProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addNewProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success && action.payload.data) {
          state.productList.push(action.payload.data);
        }
      })
      .addCase(addNewProduct.rejected, (state) => {
        state.isLoading = false;
      })

      // Edit product
      .addCase(editProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success && action.payload.data) {
          const updatedProduct = action.payload.data;
          const index = state.productList.findIndex(
            (p) => p._id === updatedProduct._id
          );
          if (index !== -1) state.productList[index] = updatedProduct;
        }
      })
      .addCase(editProduct.rejected, (state) => {
        state.isLoading = false;
      })

      // Delete product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.productList = state.productList.filter(
            (p) => p._id !== action.meta.arg
          );
        }
      })

      // Size management actions
      .addCase(addSizeToProduct.fulfilled, (state, action) => {
        if (action.payload.success && action.payload.data) {
          const updatedProduct = action.payload.data;
          const index = state.productList.findIndex(
            (p) => p._id === updatedProduct._id
          );
          if (index !== -1) state.productList[index] = updatedProduct;
        }
      })
      .addCase(updateSizeStock.fulfilled, (state, action) => {
        if (action.payload.success && action.payload.data) {
          const updatedProduct = action.payload.data;
          const index = state.productList.findIndex(
            (p) => p._id === updatedProduct._id
          );
          if (index !== -1) state.productList[index] = updatedProduct;
        }
      })
      .addCase(removeSizeFromProduct.fulfilled, (state, action) => {
        if (action.payload.success && action.payload.data) {
          const updatedProduct = action.payload.data;
          const index = state.productList.findIndex(
            (p) => p._id === updatedProduct._id
          );
          if (index !== -1) state.productList[index] = updatedProduct;
        }
      });
  },
});

export const { updateProductSizesLocally, clearProducts } =
  AdminProductsSlice.actions;
export default AdminProductsSlice.reducer;
