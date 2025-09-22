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

// Get feature images (no userId needed)
export const getFeatureImages = createAsyncThunk(
  "/order/getFeatureImages",
  async () => {
    const response = await axios.get(`${BASE_URL}/api/common/feature/get`);
    return response.data;
  }
);

// Add feature image (include userId in headers)
export const addFeatureImage = createAsyncThunk(
  "/order/addFeatureImage",
  async (image) => {
    const userId = getUserId();
    const response = await axios.post(
      `${BASE_URL}/api/common/feature/add`,
      { image },
      {
        headers: {
          "x-user-id": userId,
        },
      }
    );
    return response.data;
  }
);

// Delete feature image (include userId in headers)
export const deleteFeatureImage = createAsyncThunk(
  "/order/deleteFeatureImage",
  async (id) => {
    const userId = getUserId();
    const response = await axios.delete(
      `${BASE_URL}/api/common/feature/delete/${id}`,
      {
        headers: {
          "x-user-id": userId,
        },
      }
    );
    return response.data;
  }
);

const commonSlice = createSlice({
  name: "commonSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFeatureImages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFeatureImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featureImageList = action.payload.data;
      })
      .addCase(getFeatureImages.rejected, (state) => {
        state.isLoading = false;
        state.featureImageList = [];
      })
      .addCase(addFeatureImage.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.featureImageList.push(action.payload.data);
        }
      })
      .addCase(deleteFeatureImage.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.featureImageList = state.featureImageList.filter(
            (image) => image._id !== action.meta.arg
          );
        }
      });
  },
});

export default commonSlice.reducer;
