import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../lib/api";

export const fetchExhibitionRoles = createAsyncThunk(
  "exhibitionRoles/fetchAll",
  async (status, { rejectWithValue }) => {
    try {
      const query = status ? `?status=${status}` : "";
      const res = await api.get(`/api/exhibition-roles${query}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const createExhibitionRole = createAsyncThunk(
  "exhibitionRoles/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/exhibition-roles", data);
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const updateExhibitionRole = createAsyncThunk(
  "exhibitionRoles/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/exhibition-roles/${id}`, data);
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const deleteExhibitionRole = createAsyncThunk(
  "exhibitionRoles/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/exhibition-roles/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

const exhibitionRoleSlice = createSlice({
  name: "exhibitionRoles",
  initialState: {
    exhibitionRoles: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExhibitionRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExhibitionRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.exhibitionRoles = action.payload;
      })
      .addCase(fetchExhibitionRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createExhibitionRole.fulfilled, (state, action) => {
        state.exhibitionRoles.push(action.payload);
      })
      .addCase(updateExhibitionRole.fulfilled, (state, action) => {
        const index = state.exhibitionRoles.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) state.exhibitionRoles[index] = action.payload;
      })
      .addCase(deleteExhibitionRole.fulfilled, (state, action) => {
        state.exhibitionRoles = state.exhibitionRoles.filter((item) => item._id !== action.payload);
      });
  },
});

export default exhibitionRoleSlice.reducer;
