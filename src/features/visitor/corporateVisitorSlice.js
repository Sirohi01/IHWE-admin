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
  };
};

export const fetchCorporateVisitors = createAsyncThunk(
  "corporateVisitors/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/corporate-visitors`);
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
      const res = await axios.post(
        `${BASE_URL}/corporate-visitors`,
        {
          ...data,
          created_by: userName,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Corporate Visitor '${res.data.firstName} ${res.data.lastName}' created by ${userName}`,
            link: `/corporate-visitors/${res.data._id}`,
            section: "corporateVisitors",
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

export const updateCorporateVisitor = createAsyncThunk(
  "corporateVisitors/update",
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    const { userId, userName } = getUserInfo();
    try {
      const res = await axios.put(
        `${BASE_URL}/corporate-visitors/${id}`,
        {
          ...data,
          updated_by: userName,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Corporate Visitor '${res.data.firstName} ${res.data.lastName}' updated by ${userName}`,
            link: `/corporate-visitors/${id}`,
            section: "corporateVisitors",
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

export const deleteCorporateVisitor = createAsyncThunk(
  "corporateVisitors/delete",
  async (id, { dispatch, getState, rejectWithValue }) => {
    const { userId, userName } = getUserInfo();
    try {
      const { corporateVisitors } = getState().corporateVisitors;
      const toDelete = corporateVisitors.find((v) => v._id === id);

      await axios.delete(`${BASE_URL}/corporate-visitors/${id}`);

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
        state.corporateVisitors = action.payload;
      })
      .addCase(fetchCorporateVisitors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCorporateVisitor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCorporateVisitor.fulfilled, (state, action) => {
        state.loading = false;
        state.corporateVisitors.push(action.payload);
      })
      .addCase(createCorporateVisitor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCorporateVisitor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCorporateVisitor.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.corporateVisitors.findIndex(
          (v) => v._id === action.payload._id,
        );
        if (index !== -1) state.corporateVisitors[index] = action.payload;
      })
      .addCase(updateCorporateVisitor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteCorporateVisitor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCorporateVisitor.fulfilled, (state, action) => {
        state.loading = false;
        state.corporateVisitors = state.corporateVisitors.filter(
          (v) => v._id !== action.payload,
        );
      })
      .addCase(deleteCorporateVisitor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = corporateVisitorSlice.actions;
export default corporateVisitorSlice.reducer;
