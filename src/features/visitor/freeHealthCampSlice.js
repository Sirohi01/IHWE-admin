import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { createActivityLogThunk } from "../activityLog/activityLogSlice";

const BASE_URL = import.meta.env.VITE_API_URL;

const getUserInfo = () => {
  const userStr = sessionStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  return {
    userId: sessionStorage.getItem("user_id") || user._id,
    userName: user.name || sessionStorage.getItem("user_name") || "User",
    token: sessionStorage.getItem("token"),
  };
};

export const fetchHealthCampVisitors = createAsyncThunk(
  "healthCampVisitors/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { token } = getUserInfo();
      const res = await axios.get(`${BASE_URL}/health-camp-visitors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const createHealthCampVisitor = createAsyncThunk(
  "healthCampVisitors/create",
  async (data, { dispatch, rejectWithValue }) => {
    const { token, userId, userName } = getUserInfo();
    try {
      const res = await axios.post(
        `${BASE_URL}/health-camp-visitors`,
        {
          ...data,
          created_by: userName,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Health Camp Visitor '${res.data.firstName} ${res.data.lastName}' created by ${userName}`,
            link: `/health-camp-visitors/${res.data._id}`,
            section: "healthCampVisitors",
            data: {
              action: "CREATE",
              visitor_id: res.data._id,
              created_data: res.data,
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
    const { token, userId, userName } = getUserInfo();
    try {
      const res = await axios.put(
        `${BASE_URL}/health-camp-visitors/${id}`,
        {
          ...data,
          updated_by: userName,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Health Camp Visitor '${res.data.firstName} ${res.data.lastName}' updated by ${userName}`,
            link: `/health-camp-visitors/${id}`,
            section: "healthCampVisitors",
            data: { action: "UPDATE", visitor_id: id, updated_data: res.data },
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
    const { token, userId, userName } = getUserInfo();
    try {
      const { healthCampVisitors } = getState().healthCampVisitors;
      const toDelete = healthCampVisitors.find((v) => v._id === id);

      await axios.delete(`${BASE_URL}/health-camp-visitors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
        state.healthCampVisitors = action.payload;
      })
      .addCase(fetchHealthCampVisitors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createHealthCampVisitor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHealthCampVisitor.fulfilled, (state, action) => {
        state.loading = false;
        state.healthCampVisitors.push(action.payload);
      })
      .addCase(createHealthCampVisitor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateHealthCampVisitor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHealthCampVisitor.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.healthCampVisitors.findIndex(
          (v) => v._id === action.payload._id,
        );
        if (index !== -1) state.healthCampVisitors[index] = action.payload;
      })
      .addCase(updateHealthCampVisitor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteHealthCampVisitor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteHealthCampVisitor.fulfilled, (state, action) => {
        state.loading = false;
        state.healthCampVisitors = state.healthCampVisitors.filter(
          (v) => v._id !== action.payload,
        );
      })
      .addCase(deleteHealthCampVisitor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError: clearHealthCampError } = freeHealthCampSlice.actions;
export default freeHealthCampSlice.reducer;
