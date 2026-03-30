import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { createActivityLogThunk } from "../../activityLog/activityLogSlice";

const BASE_URL = import.meta.env.VITE_API_URL;

// ✅ Fetch All Data Sources
export const fetchDataSources = createAsyncThunk(
  "dataSources/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/data-source`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// ✅ Fetch Single Data Source by ID
export const fetchDataSourceById = createAsyncThunk(
  "dataSources/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/data-source/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// ✅ Create New Data Source
export const createDataSource = createAsyncThunk(
  "dataSources/create",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASE_URL}/data-source`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const userStr = sessionStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = sessionStorage.getItem("user_id") || user._id;
      const userName = user.name || "User";

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Data Source '${res.data.source_name || res.data.name || ""}' created by ${userName}`,
            link: `/data-source`,
            section: "dataSource",
            data: {
              action: "CREATE",
              source_id: res.data._id,
              source_name: res.data.source_name || res.data.name,
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

// ✅ Update Existing Data Source
export const updateDataSource = createAsyncThunk(
  "dataSources/update",
  async ({ id, updates }, { dispatch, rejectWithValue }) => {
    try {
      const userStr = sessionStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = sessionStorage.getItem("user_id") || user._id;
      const userName = user.name || "User";

      const updatesWithUser = {
        ...updates,
        updated_by: userId || null,
      };

      const res = await axios.put(
        `${BASE_URL}/data-source/${id}`,
        updatesWithUser,
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
            message: `Data Source '${res.data.source_name || id}' updated by ${userName}`,
            link: `/data-source`,
            section: "dataSource",
            data: {
              action: "UPDATE",
              source_id: id,
              source_name: res.data.source_name,
              updated_fields: updates,
              updated_data: res.data,
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

// ✅ Delete Data Source
export const deleteDataSource = createAsyncThunk(
  "dataSources/delete",
  async (id, { dispatch, getState, rejectWithValue }) => {
    try {
      const { dataSources } = getState().dataSources;
      const sourceToDelete = dataSources.find((s) => s._id === id);

      await axios.delete(`${BASE_URL}/data-source/${id}`);

      const userStr = sessionStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = sessionStorage.getItem("user_id") || user._id;
      const userName = user.name || "User";

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Data Source '${sourceToDelete?.source_name || sourceToDelete?.name || id}' deleted by ${userName}`,
            link: `/data-source`,
            section: "dataSource",
            data: {
              action: "DELETE",
              source_id: id,
              source_name: sourceToDelete?.source_name || sourceToDelete?.name,
              deleted_data: sourceToDelete || {},
            },
          }),
        );
      }

      // ✅ FIX: id return karo
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

const initialState = {
  dataSources: [],
  loading: false,
  error: null,
};

const dataSourceSlice = createSlice({
  name: "dataSources",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchDataSources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDataSources.fulfilled, (state, action) => {
        state.loading = false;
        state.dataSources = action.payload;
      })
      .addCase(fetchDataSources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Single
      .addCase(fetchDataSourceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDataSourceById.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.dataSources.findIndex(
          (s) => s._id === action.payload._id,
        );
        if (index !== -1) {
          state.dataSources[index] = action.payload;
        } else {
          state.dataSources.push(action.payload);
        }
      })
      .addCase(fetchDataSourceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createDataSource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDataSource.fulfilled, (state, action) => {
        state.loading = false;
        state.dataSources.push(action.payload);
      })
      .addCase(createDataSource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateDataSource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDataSource.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.dataSources.findIndex(
          (s) => s._id === action.payload._id,
        );
        if (index !== -1) state.dataSources[index] = action.payload;
      })
      .addCase(updateDataSource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteDataSource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDataSource.fulfilled, (state, action) => {
        state.loading = false;
        // ✅ FIX: direct id se filter
        state.dataSources = state.dataSources.filter(
          (s) => s._id !== action.payload,
        );
      })
      .addCase(deleteDataSource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = dataSourceSlice.actions;
export default dataSourceSlice.reducer;
