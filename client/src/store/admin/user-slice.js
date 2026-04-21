import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api";

const initialState = {
  isLoading: false,
  userList: [],
  userDetails: null,
};

export const getAllUsers = createAsyncThunk(
  "/admin/users/getAllUsers",
  async () => {
    const response = await api.get("/admin/users/get");
    return response.data;
  }
);

export const getUserDetails = createAsyncThunk(
  "/admin/users/getUserDetails",
  async (id) => {
    const response = await api.get(`/admin/users/details/${id}`);
    return response.data;
  }
);

const adminUserSlice = createSlice({
  name: "adminUser",
  initialState,
  reducers: {
    setUserDetails: (state) => {
      state.userDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userList = action.payload.data;
      })
      .addCase(getAllUsers.rejected, (state) => {
        state.isLoading = false;
        state.userList = [];
      })
      .addCase(getUserDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userDetails = action.payload.data;
      })
      .addCase(getUserDetails.rejected, (state) => {
        state.isLoading = false;
        state.userDetails = null;
      });
  },
});

export const { setUserDetails } = adminUserSlice.actions;
export default adminUserSlice.reducer;
