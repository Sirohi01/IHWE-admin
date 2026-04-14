import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/api";

export const createActivityLogThunk = createAsyncThunk(
  "activityLog/create",
  async (payload, { rejectWithValue }) => {
    try {
      let formattedAction = payload.action || (payload.data && payload.data.action) || "Action";
      if (formattedAction === "CREATE") formattedAction = "Created";
      if (formattedAction === "UPDATE") formattedAction = "Updated";
      if (formattedAction === "DELETE") formattedAction = "Deleted";

      // Default fallback path agar link explicitly pass nahi kiya gaya ho
      const defaultPath = `/${(payload.module || "dashboard").toLowerCase().replace(/\s+/g, "-")}`;

      const finalPayload = {
        user_id: payload.user_id,
        user: payload.user || "Admin",
        action: formattedAction,
        module: payload.module || payload.section || "System",
        details: payload.details || payload.message || "System action performed",
        link: payload.link ? `${window.location.origin}${payload.link}` : `${window.location.origin}${defaultPath}`,
      };

      const res = await axios.post(`${BASE_URL}/api/activity-logs/create`, finalPayload);
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
