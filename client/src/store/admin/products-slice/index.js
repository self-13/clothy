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
  "/products/addnewproduct",
  async (formData) => {
    const userId = getUserId();
    const result = await axios.post(
      `${BASE_URL}/api/admin/products/add`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
      }
    );
    return result?.data;
  }
);

// Fetch all products
export const fetchAllProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async () => {
    const userId = getUserId();
    const result = await axios.get(`${BASE_URL}/api/admin/products/fetch-all`, {
      headers: { "x-user-id": userId },
    });
    return result?.data;
  }
);

// Edit product
export const editProduct = createAsyncThunk(
  "/products/editProduct",
  async ({ id, formData }) => {
    const userId = getUserId();
    const result = await axios.put(
      `${BASE_URL}/api/admin/products/edit/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
      }
    );
    return result?.data;
  }
);

// Delete product
export const deleteProduct = createAsyncThunk(
  "/products/deleteProduct",
  async (id) => {
    const userId = getUserId();
    const result = await axios.delete(
      `${BASE_URL}/api/admin/products/delete/${id}`,
      {
        headers: { "x-user-id": userId },
      }
    );
    return result?.data;
  }
);

// Add size to product
export const addSizeToProduct = createAsyncThunk(
  "/products/addSizeToProduct",
  async ({ productId, size, stock }) => {
    const userId = getUserId();
    const result = await axios.post(
      `${BASE_URL}/api/admin/products/${productId}/sizes`,
      { size, stock },
      {
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
      }
    );
    return result?.data;
  }
);

// Update size stock
export const updateSizeStock = createAsyncThunk(
  "/products/updateSizeStock",
  async ({ productId, sizeId, stock }) => {
    const userId = getUserId();
    const result = await axios.put(
      `${BASE_URL}/api/admin/products/${productId}/sizes/${sizeId}`,
      { stock },
      {
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
      }
    );
    return result?.data;
  }
);

// Remove size from product
export const removeSizeFromProduct = createAsyncThunk(
  "/products/removeSizeFromProduct",
  async ({ productId, sizeId }) => {
    const userId = getUserId();
    const result = await axios.delete(
      `${BASE_URL}/api/admin/products/${productId}/sizes/${sizeId}`,
      {
        headers: { "x-user-id": userId },
      }
    );
    return result?.data;
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
  },
  extraReducers: (builder) => {
    builder
      // Fetch all products
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data;
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
        if (action.payload.success) state.productList.push(action.payload.data);
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
        if (action.payload.success) {
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

      // Add size
      .addCase(addSizeToProduct.fulfilled, (state, action) => {
        if (action.payload.success) {
          const updatedProduct = action.payload.data;
          const index = state.productList.findIndex(
            (p) => p._id === updatedProduct._id
          );
          if (index !== -1) state.productList[index] = updatedProduct;
        }
      })

      // Update size stock
      .addCase(updateSizeStock.fulfilled, (state, action) => {
        if (action.payload.success) {
          const updatedProduct = action.payload.data;
          const index = state.productList.findIndex(
            (p) => p._id === updatedProduct._id
          );
          if (index !== -1) state.productList[index] = updatedProduct;
        }
      })

      // Remove size
      .addCase(removeSizeFromProduct.fulfilled, (state, action) => {
        if (action.payload.success) {
          const updatedProduct = action.payload.data;
          const index = state.productList.findIndex(
            (p) => p._id === updatedProduct._id
          );
          if (index !== -1) state.productList[index] = updatedProduct;
        }
      });
  },
});

export const { updateProductSizesLocally } = AdminProductsSlice.actions;
export default AdminProductsSlice.reducer;
