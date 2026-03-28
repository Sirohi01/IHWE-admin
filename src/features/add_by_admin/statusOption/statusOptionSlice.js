import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { createActivityLogThunk } from "../../activityLog/activityLogSlice";

const BASE_URL = import.meta.env.VITE_API_URL;

// ✅ Fetch All Status Options
export const fetchStatusOptions = createAsyncThunk(
  "statusOptions/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/status-option`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// ✅ Create Status Option
export const createStatusOption = createAsyncThunk(
  "statusOptions/create",
  async (data, { dispatch, rejectWithValue }) => {
    const token = sessionStorage.getItem("token");
    if (!token) return rejectWithValue("No token provided");

    try {
      const res = await axios.post(`${BASE_URL}/status-option`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const userStr = sessionStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = sessionStorage.getItem("user_id") || user._id;
      const userName = user.name || "User";

      // ✅ res.data.data ya res.data — dono handle karo
      const created = res.data.data || res.data;

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Status '${created.name || ""}' created by ${userName}`,
            link: `/status-option`,
            section: "statusOptions",
            data: {
              action: "CREATE",
              status_id: created._id,
              name: created.name,
              created_data: created,
            },
          }),
        );
      }

      return created;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// ✅ Update Status Option
export const updateStatusOption = createAsyncThunk(
  "statusOptions/update",
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");

      const userStr = sessionStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = sessionStorage.getItem("user_id") || user._id;
      const userName = user.name || "User";

      // ✅ updated_by add karo
      const dataWithUser = {
        ...data,
        updated_by: userId || null,
      };

      const res = await axios.put(
        `${BASE_URL}/status-option/${id}`,
        dataWithUser,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const updated = res.data.data || res.data;

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Status '${updated.name || data.name || id}' updated by ${userName}`,
            link: `/status-option`,
            section: "statusOptions",
            data: {
              action: "UPDATE",
              status_id: id,
              name: updated.name || data.name,
              updated_fields: data,
              updated_data: updated,
            },
          }),
        );
      }

      return updated;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// ✅ Delete Status Option
export const deleteStatusOption = createAsyncThunk(
  "statusOptions/delete",
  async (id, { dispatch, getState, rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");

      const { statusOptions } = getState().statusOptions;
      const statusToDelete = statusOptions.find((s) => s._id === id);

      await axios.delete(`${BASE_URL}/status-option/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userStr = sessionStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = sessionStorage.getItem("user_id") || user._id;
      const userName = user.name || "User";

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Status '${statusToDelete?.name || id}' deleted by ${userName}`,
            link: `/status-option`,
            section: "statusOptions",
            data: {
              action: "DELETE",
              status_id: id,
              name: statusToDelete?.name,
              deleted_data: statusToDelete || {},
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

const initialState = {
  statusOptions: [],
  loading: false,
  error: null,
};

const statusOptionSlice = createSlice({
  name: "statusOptions",
  initialState,
  reducers: {
    clearStatusError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchStatusOptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStatusOptions.fulfilled, (state, action) => {
        state.loading = false;
        state.statusOptions = action.payload;
      })
      .addCase(fetchStatusOptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createStatusOption.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStatusOption.fulfilled, (state, action) => {
        state.loading = false;
        state.statusOptions.push(action.payload);
      })
      .addCase(createStatusOption.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateStatusOption.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStatusOption.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.statusOptions.findIndex(
          (item) => item._id === action.payload._id,
        );
        if (index !== -1) state.statusOptions[index] = action.payload;
      })
      .addCase(updateStatusOption.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteStatusOption.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStatusOption.fulfilled, (state, action) => {
        state.loading = false;
        state.statusOptions = state.statusOptions.filter(
          (item) => item._id !== action.payload,
        );
      })
      .addCase(deleteStatusOption.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStatusError } = statusOptionSlice.actions;
export default statusOptionSlice.reducer;
