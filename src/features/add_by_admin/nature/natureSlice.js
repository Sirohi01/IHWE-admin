import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { createActivityLogThunk } from "../../activityLog/activityLogSlice";

const BASE_URL = import.meta.env.VITE_API_URL;

// ✅ Fetch All Natures
export const fetchNatures = createAsyncThunk(
  "natures/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/nature-of-business`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// ✅ Fetch Single Nature by ID
export const fetchNatureById = createAsyncThunk(
  "natures/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/nature-of-business/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// ✅ Create Nature
export const createNature = createAsyncThunk(
  "natures/create",
  async (natureData, { dispatch, rejectWithValue }) => {
    const token = sessionStorage.getItem("token");
    if (!token) return rejectWithValue("No token provided");

    try {
      const response = await axios.post(
        `${BASE_URL}/nature-of-business`,
        natureData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const userStr = sessionStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = sessionStorage.getItem("user_id") || user._id;
      const userName = user.name || "User";

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Nature of Business '${response.data.nature_name || ""}' created by ${userName}`,
            link: `/nature-of-business`,
            section: "natureOfBusiness",
            data: {
              action: "CREATE",
              nature_id: response.data._id,
              nature_name: response.data.nature_name,
              created_data: response.data,
            },
          }),
        );
      }

      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// ✅ Update Nature
export const updateNature = createAsyncThunk(
  "natures/update",
  async ({ id, updates }, { dispatch, rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.put(
        `${BASE_URL}/nature-of-business/${id}`,
        updates,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const userStr = sessionStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = sessionStorage.getItem("user_id") || user._id;
      const userName = user.name || "User";

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Nature of Business '${response.data.nature_name || updates.nature_name || id}' updated by ${userName}`,
            link: `/nature-of-business`,
            section: "natureOfBusiness",
            data: {
              action: "UPDATE",
              nature_id: id,
              nature_name: response.data.nature_name || updates.nature_name,
              updated_fields: updates,
              updated_data: response.data,
            },
          }),
        );
      }

      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// ✅ Delete Nature
export const deleteNature = createAsyncThunk(
  "natures/delete",
  async (id, { dispatch, getState, rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");

      // ✅ FIX: delete se pehle name save karo
      const { natures } = getState().natures;
      const natureToDelete = natures.find((n) => n._id === id);

      await axios.delete(`${BASE_URL}/nature-of-business/${id}`, {
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
            message: `Nature of Business '${natureToDelete?.nature_name || id}' deleted by ${userName}`,
            link: `/nature-of-business`,
            section: "natureOfBusiness",
            data: {
              action: "DELETE",
              nature_id: id,
              nature_name: natureToDelete?.nature_name,
              deleted_data: natureToDelete || {},
            },
          }),
        );
      }

      // ✅ FIX: id return karo — component filter ke liye
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

const initialState = {
  natures: [],
  loading: false,
  error: null,
};

const natureSlice = createSlice({
  name: "natures",
  initialState,
  reducers: {
    clearNatureError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchNatures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNatures.fulfilled, (state, action) => {
        state.loading = false;
        state.natures = action.payload;
      })
      .addCase(fetchNatures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Single
      .addCase(fetchNatureById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNatureById.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.natures.findIndex(
          (n) => n._id === action.payload._id,
        );
        if (index !== -1) {
          state.natures[index] = action.payload;
        } else {
          state.natures.push(action.payload);
        }
      })
      .addCase(fetchNatureById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createNature.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNature.fulfilled, (state, action) => {
        state.loading = false;
        state.natures.push(action.payload);
      })
      .addCase(createNature.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateNature.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNature.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.natures.findIndex(
          (n) => n._id === action.payload._id,
        );
        if (index !== -1) state.natures[index] = action.payload;
      })
      .addCase(updateNature.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteNature.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNature.fulfilled, (state, action) => {
        state.loading = false;
        // ✅ FIX: ab id return hota hai — direct filter karo
        state.natures = state.natures.filter((n) => n._id !== action.payload);
      })
      .addCase(deleteNature.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearNatureError } = natureSlice.actions;
export default natureSlice.reducer;
