import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/api";
import { createActivityLogThunk } from "../activityLog/activityLogSlice";

const getUserInfo = () => {
  const adminData = JSON.parse(
    localStorage.getItem("adminInfo") ||
    sessionStorage.getItem("adminInfo") ||
    "{}",
  );
  const userStr = sessionStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  return {
    userId:
      adminData._id ||
      adminData.id ||
      sessionStorage.getItem("user_id") ||
      user._id ||
      "admin",
    userName:
      adminData.name ||
      adminData.username ||
      user.name ||
      sessionStorage.getItem("user_name") ||
      "Admin",
  };
};

export const fetchInternationalVisitors = createAsyncThunk(
  "internationalVisitors/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/international-visitors");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const createInternationalVisitor = createAsyncThunk(
  "internationalVisitors/create",
  async (data, { dispatch, rejectWithValue }) => {
    const { userId, userName } = getUserInfo();
    try {
      const res = await api.post("/api/international-visitors", {
        ...data,
        created_by: userName,
      });

      const visitorData = res.data.data || res.data;

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `International Visitor '${visitorData.firstName} ${visitorData.lastName}' created by ${userName}`,
            link: `/international-visitors/${visitorData._id}`,
            section: "internationalVisitors",
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

export const updateInternationalVisitor = createAsyncThunk(
  "internationalVisitors/update",
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    const { userId, userName } = getUserInfo();
    try {
      const res = await api.put(`/api/international-visitors/${id}`, {
        ...data,
        updated_by: userName,
      });

      const visitorData = res.data.data || res.data;

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `International Visitor '${visitorData.firstName} ${visitorData.lastName}' updated by ${userName}`,
            link: `/international-visitors/${id}`,
            section: "internationalVisitors",
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

export const deleteInternationalVisitor = createAsyncThunk(
  "internationalVisitors/delete",
  async (id, { dispatch, getState, rejectWithValue }) => {
    const { userId, userName } = getUserInfo();
    try {
      const { internationalVisitors } = getState().internationalVisitors;
      const toDelete = internationalVisitors.find((v) => v._id === id);

      await api.delete(`/api/international-visitors/${id}`);

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `International Visitor '${toDelete?.firstName || id}' deleted by ${userName}`,
            section: "internationalVisitors",
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

const internationalVisitorslice = createSlice({
  name: "internationalVisitors",
  initialState: { internationalVisitors: [], loading: false, error: null },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInternationalVisitors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInternationalVisitors.fulfilled, (state, action) => {
        state.loading = false;
        // ✅ Handle data structure safely
        state.internationalVisitors = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data || [];
      })
      .addCase(fetchInternationalVisitors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createInternationalVisitor.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data || action.payload;
        if (data?._id) state.internationalVisitors.push(data);
      })
      .addCase(updateInternationalVisitor.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data || action.payload;
        if (!data?._id) return;
        const index = state.internationalVisitors.findIndex((v) => v._id === data._id);
        if (index !== -1) state.internationalVisitors[index] = data;
      })
      .addCase(deleteInternationalVisitor.fulfilled, (state, action) => {
        state.loading = false;
        state.internationalVisitors = state.internationalVisitors.filter(
          (v) => v._id !== action.payload,
        );
      });
  },
});

export const { clearError } = internationalVisitorslice.actions;
export default internationalVisitorslice.reducer;



