import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  featureImageList: [],
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

// Get feature images
export const getFeatureImages = createAsyncThunk(
  "common/getFeatureImages",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/common/feature/get`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Add feature image - FIXED: Now accepts imageUrl string directly
export const addFeatureImage = createAsyncThunk(
  "common/addFeatureImage",
  async (imageUrl, { rejectWithValue }) => {
    try {
      const userId = getUserId();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      if (!imageUrl) {
        throw new Error("Image URL is required");
      }

      console.log("🔄 Sending image to backend:", imageUrl);

      const response = await axios.post(
        `${BASE_URL}/api/common/feature/add`,
        {
          image: imageUrl, // Send as "image" field
        },
        {
          headers: {
            "x-user-id": userId,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Backend response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error in addFeatureImage:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete feature image
export const deleteFeatureImage = createAsyncThunk(
  "common/deleteFeatureImage",
  async (id, { rejectWithValue }) => {
    try {
      const userId = getUserId();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const response = await axios.delete(
        `${BASE_URL}/api/common/feature/delete/${id}`,
        {
          headers: {
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

const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {
    clearFeatureImages: (state) => {
      state.featureImageList = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Feature Images
      .addCase(getFeatureImages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFeatureImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featureImageList = action.payload.data || [];
      })
      .addCase(getFeatureImages.rejected, (state) => {
        state.isLoading = false;
        state.featureImageList = [];
      })
      // Add Feature Image
      .addCase(addFeatureImage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addFeatureImage.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success && action.payload.data) {
          state.featureImageList.push(action.payload.data);
        }
      })
      .addCase(addFeatureImage.rejected, (state) => {
        state.isLoading = false;
      })
      // Delete Feature Image
      .addCase(deleteFeatureImage.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.featureImageList = state.featureImageList.filter(
            (image) => image._id !== action.meta.arg
          );
        }
      });
  },
});

export const { clearFeatureImages } = commonSlice.actions;
export default commonSlice.reducer;
