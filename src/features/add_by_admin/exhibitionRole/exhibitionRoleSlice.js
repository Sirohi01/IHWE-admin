import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../lib/api";

export const fetchExhibitionRoles = createAsyncThunk(
  "exhibitionRoles/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      let query = "";
      if (typeof params === "string") {
        query = params ? `?status=${encodeURIComponent(params)}` : "";
      } else if (params && typeof params === "object") {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") searchParams.append(key, value);
        });
        query = searchParams.toString() ? `?${searchParams.toString()}` : "";
      }
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
  async (payload, { rejectWithValue }) => {
    try {
      const id = typeof payload === "object" ? payload.id : payload;
      const data = typeof payload === "object" ? payload.data : undefined;
      const res = await api.delete(`/api/exhibition-roles/${id}`, { data });
      return res.data.data || { _id: id };
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
        const index = state.exhibitionRoles.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) state.exhibitionRoles[index] = action.payload;
        else state.exhibitionRoles.push(action.payload);
      })
      .addCase(updateExhibitionRole.fulfilled, (state, action) => {
        const index = state.exhibitionRoles.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) state.exhibitionRoles[index] = action.payload;
      })
      .addCase(deleteExhibitionRole.fulfilled, (state, action) => {
        const index = state.exhibitionRoles.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) state.exhibitionRoles[index] = action.payload;
      });
  },
});

export default exhibitionRoleSlice.reducer;
