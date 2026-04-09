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

export const fetchGeneralVisitors = createAsyncThunk(
  "generalVisitors/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/general-visitors");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const createGeneralVisitor = createAsyncThunk(
  "generalVisitors/create",
  async (data, { dispatch, rejectWithValue }) => {
    const { userId, userName } = getUserInfo();
    try {
      const res = await api.post("/api/general-visitors", {
        ...data,
        created_by: userName,
      });

      const visitorData = res.data.data || res.data;

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `General Visitor '${visitorData.firstName} ${visitorData.lastName}' created by ${userName}`,
            link: `/general-visitors/${visitorData._id}`,
            section: "generalVisitors",
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

export const updateGeneralVisitor = createAsyncThunk(
  "generalVisitors/update",
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    const { userId, userName } = getUserInfo();
    try {
      const res = await api.put(`/api/general-visitors/${id}`, {
        ...data,
        updated_by: userName,
      });

      const visitorData = res.data.data || res.data;

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `General Visitor '${visitorData.firstName} ${visitorData.lastName}' updated by ${userName}`,
            link: `/general-visitors/${id}`,
            section: "generalVisitors",
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

export const deleteGeneralVisitor = createAsyncThunk(
  "generalVisitors/delete",
  async (id, { dispatch, getState, rejectWithValue }) => {
    const { userId, userName } = getUserInfo();
    try {
      const { generalVisitors } = getState().generalVisitors;
      const toDelete = generalVisitors.find((v) => v._id === id);

      await api.delete(`/api/general-visitors/${id}`);

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `General Visitor '${toDelete?.firstName || id}' deleted by ${userName}`,
            section: "generalVisitors",
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

const generalVisitorSlice = createSlice({
  name: "generalVisitors",
  initialState: { generalVisitors: [], loading: false, error: null },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGeneralVisitors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGeneralVisitors.fulfilled, (state, action) => {
        state.loading = false;
        // ✅ Handle data structure safely
        state.generalVisitors = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data || [];
      })
      .addCase(fetchGeneralVisitors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createGeneralVisitor.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data || action.payload;
        if (data?._id) state.generalVisitors.push(data);
      })
      .addCase(updateGeneralVisitor.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data || action.payload;
        if (!data?._id) return;
        const index = state.generalVisitors.findIndex((v) => v._id === data._id);
        if (index !== -1) state.generalVisitors[index] = data;
      })
      .addCase(deleteGeneralVisitor.fulfilled, (state, action) => {
        state.loading = false;
        state.generalVisitors = state.generalVisitors.filter(
          (v) => v._id !== action.payload,
        );
      });
  },
});

export const { clearError: clearGeneralError } = generalVisitorSlice.actions;
export default generalVisitorSlice.reducer;
