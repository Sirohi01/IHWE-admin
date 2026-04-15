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

export const fetchCorporateVisitors = createAsyncThunk(
  "corporateVisitors/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/corporate-visitors");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const createCorporateVisitor = createAsyncThunk(
  "corporateVisitors/create",
  async (data, { dispatch, rejectWithValue }) => {
    const { userId, userName } = getUserInfo();
    try {
      const res = await api.post("/api/corporate-visitors", {
        ...data,
        created_by: userName,
      });

      const visitorData = res.data.data || res.data;

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Corporate Visitor '${visitorData.firstName} ${visitorData.lastName}' created by ${userName}`,
            link: `/corporate-visitors/${visitorData._id}`,
            section: "corporateVisitors",
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

export const updateCorporateVisitor = createAsyncThunk(
  "corporateVisitors/update",
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    const { userId, userName } = getUserInfo();
    try {
      const res = await api.put(`/api/corporate-visitors/${id}`, {
        ...data,
        updated_by: userName,
      });

      const visitorData = res.data.data || res.data;

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Corporate Visitor '${visitorData.firstName} ${visitorData.lastName}' updated by ${userName}`,
            link: `/corporate-visitors/${id}`,
            section: "corporateVisitors",
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

export const deleteCorporateVisitor = createAsyncThunk(
  "corporateVisitors/delete",
  async (id, { dispatch, getState, rejectWithValue }) => {
    const { userId, userName } = getUserInfo();
    try {
      const { corporateVisitors } = getState().corporateVisitors;
      const toDelete = corporateVisitors.find((v) => v._id === id);

      await api.delete(`/api/corporate-visitors/${id}`);

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Corporate Visitor '${toDelete?.firstName || id}' deleted by ${userName}`,
            section: "corporateVisitors",
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

const corporateVisitorSlice = createSlice({
  name: "corporateVisitors",
  initialState: { corporateVisitors: [], loading: false, error: null },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCorporateVisitors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCorporateVisitors.fulfilled, (state, action) => {
        state.loading = false;
        // ✅ Handle data structure safely
        state.corporateVisitors = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data || [];
      })
      .addCase(fetchCorporateVisitors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCorporateVisitor.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data || action.payload;
        if (data?._id) state.corporateVisitors.push(data);
      })
      .addCase(updateCorporateVisitor.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data || action.payload;
        if (!data?._id) return;
        const index = state.corporateVisitors.findIndex((v) => v._id === data._id);
        if (index !== -1) state.corporateVisitors[index] = data;
      })
      .addCase(deleteCorporateVisitor.fulfilled, (state, action) => {
        state.loading = false;
        state.corporateVisitors = state.corporateVisitors.filter(
          (v) => v._id !== action.payload,
        );
      });
  },
});

export const { clearError } = corporateVisitorSlice.actions;
export default corporateVisitorSlice.reducer;
