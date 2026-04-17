import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Thunk for fetching blogs
export const fetchBlogs = createAsyncThunk(
  "blogs/fetchBlogs",
  async (_, { rejectWithValue, getState }) => {
    const state = getState();
    const ip = state.auth.ip; // Get API base URL from auth state
    try {
      console.log("Fetching blogs from:", `${ip}get/blog`);
      const response = await axios.get(`${ip}get/blog`);

      if (response.data.status === 201) {
        return response.data.data; // Return blogs data on success
      } else {
        console.error("Error:", response.data.message);
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Blog Slice
const blogSlice = createSlice({
  name: "blogs",
  initialState: {
    blogs: [], // Array to store blogs
    isLoading: false,
    error: null,
  },
  reducers: {}, // No synchronous reducers for now
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blogs = action.payload; // Update blogs in state
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload; // Set error message
      });
  },
});

export default blogSlice.reducer;
