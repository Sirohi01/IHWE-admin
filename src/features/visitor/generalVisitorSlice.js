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

export const fetchGeneralVisitors = createAsyncThunk(
  "generalVisitors/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { token } = getUserInfo();
      const res = await axios.get(`${BASE_URL}/general-visitors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data ?? res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const createGeneralVisitor = createAsyncThunk(
  "generalVisitors/create",
  async (data, { dispatch, rejectWithValue }) => {
    const { token, userId, userName } = getUserInfo();
    try {
      const res = await axios.post(
        `${BASE_URL}/general-visitors`,
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
            message: `General Visitor '${res.data.firstName} ${res.data.lastName}' created by ${userName}`,
            link: `/general-visitors/${res.data._id}`,
            section: "generalVisitors",
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

export const updateGeneralVisitor = createAsyncThunk(
  "generalVisitors/update",
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    const { token, userId, userName } = getUserInfo();
    try {
      const res = await axios.put(
        `${BASE_URL}/general-visitors/${id}`,
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
            message: `General Visitor '${res.data.firstName} ${res.data.lastName}' updated by ${userName}`,
            link: `/general-visitors/${id}`,
            section: "generalVisitors",
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

export const deleteGeneralVisitor = createAsyncThunk(
  "generalVisitors/delete",
  async (id, { dispatch, getState, rejectWithValue }) => {
    const { token, userId, userName } = getUserInfo();
    try {
      const { generalVisitors } = getState().generalVisitors;
      const toDelete = generalVisitors.find((v) => v._id === id);

      await axios.delete(`${BASE_URL}/general-visitors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
        state.generalVisitors = action.payload;
      })
      .addCase(fetchGeneralVisitors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createGeneralVisitor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGeneralVisitor.fulfilled, (state, action) => {
        state.loading = false;
        state.generalVisitors.push(action.payload);
      })
      .addCase(createGeneralVisitor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateGeneralVisitor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGeneralVisitor.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.generalVisitors.findIndex(
          (v) => v._id === action.payload._id,
        );
        if (index !== -1) state.generalVisitors[index] = action.payload;
      })
      .addCase(updateGeneralVisitor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteGeneralVisitor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGeneralVisitor.fulfilled, (state, action) => {
        state.loading = false;
        state.generalVisitors = state.generalVisitors.filter(
          (v) => v._id !== action.payload,
        );
      })
      .addCase(deleteGeneralVisitor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError: clearGeneralError } = generalVisitorSlice.actions;
export default generalVisitorSlice.reducer;
