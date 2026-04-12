import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/api";

export const createActivityLogThunk = createAsyncThunk(
  "activityLog/create",
  async (
    { user_id, message, link, section, data = {} },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.post(`/api/activity-logs/create`, {
        user_id,
        message,
        link,
        section,
        data,
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const fetchActivityLogs = createAsyncThunk(
  "activityLog/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/activity-logs`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

const activityLogSlice = createSlice({
  name: "activityLog",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createActivityLogThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createActivityLogThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data.unshift(action.payload);
      })
      .addCase(createActivityLogThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchActivityLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchActivityLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default activityLogSlice.reducer;
