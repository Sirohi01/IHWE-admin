import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/api";
import { createActivityLogThunk } from "../activityLog/activityLogSlice";

const getUserInfo = () => {
  const userStr = sessionStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  return {
    userId: sessionStorage.getItem("user_id") || user._id,
    userName: user.name || sessionStorage.getItem("user_name") || "User",
  };
};

export const fetchHealthCampVisitors = createAsyncThunk(
  "healthCampVisitors/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/health-camp-visitors");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const createHealthCampVisitor = createAsyncThunk(
  "healthCampVisitors/create",
  async (data, { dispatch, rejectWithValue }) => {
    const { userId, userName } = getUserInfo();
    try {
      const res = await api.post("/api/health-camp-visitors", {
        ...data,
        created_by: userName,
      });

      const visitorData = res.data.data || res.data;

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Health Camp Visitor '${visitorData.firstName} ${visitorData.lastName}' created by ${userName}`,
            link: `/health-camp-visitors/${visitorData._id}`,
            section: "healthCampVisitors",
            data: {
              action: "CREATE",
              visitor_id: visitorData._id,
              created_data: visitorData,
            },
          }),
        );
      }
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const updateHealthCampVisitor = createAsyncThunk(
  "healthCampVisitors/update",
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    const { userId, userName } = getUserInfo();
    try {
      const res = await api.put(`/api/health-camp-visitors/${id}`, {
        ...data,
        updated_by: userName,
      });

      const visitorData = res.data.data || res.data;

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Health Camp Visitor '${visitorData.firstName} ${visitorData.lastName}' updated by ${userName}`,
            link: `/health-camp-visitors/${id}`,
            section: "healthCampVisitors",
            data: { action: "UPDATE", visitor_id: id, updated_data: visitorData },
          }),
        );
      }
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const deleteHealthCampVisitor = createAsyncThunk(
  "healthCampVisitors/delete",
  async (id, { dispatch, getState, rejectWithValue }) => {
    const { userId, userName } = getUserInfo();
    try {
      const { healthCampVisitors } = getState().healthCampVisitors;
      const toDelete = healthCampVisitors.find((v) => v._id === id);

      await api.delete(`/api/health-camp-visitors/${id}`);

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Health Camp Visitor '${toDelete?.firstName || id}' deleted by ${userName}`,
            section: "healthCampVisitors",
            data: {
              action: "DELETE",
              visitor_id: id,
              deleted_data: toDelete || {},
            },
          }),
        );
      }
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

const freeHealthCampSlice = createSlice({
  name: "healthCampVisitors",
  initialState: { healthCampVisitors: [], loading: false, error: null },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHealthCampVisitors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHealthCampVisitors.fulfilled, (state, action) => {
        state.loading = false;
        // ✅ Handle data structure safely
        state.healthCampVisitors = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data || [];
      })
      .addCase(fetchHealthCampVisitors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createHealthCampVisitor.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data || action.payload;
        if (data?._id) state.healthCampVisitors.push(data);
      })
      .addCase(updateHealthCampVisitor.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data || action.payload;
        if (!data?._id) return;
        const index = state.healthCampVisitors.findIndex((v) => v._id === data._id);
        if (index !== -1) state.healthCampVisitors[index] = data;
      })
      .addCase(deleteHealthCampVisitor.fulfilled, (state, action) => {
        state.loading = false;
        state.healthCampVisitors = state.healthCampVisitors.filter(
          (v) => v._id !== action.payload,
        );
      });
  },
});

export const { clearError: clearHealthCampError } = freeHealthCampSlice.actions;
export default freeHealthCampSlice.reducer;
