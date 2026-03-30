import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { createActivityLogThunk } from "../activityLog/activityLogSlice";

const BASE_URL = import.meta.env.VITE_API_URL;

// GET All Events
export const fetchEvents = createAsyncThunk(
  "crmEvents/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/crm-events`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// GET Single Event by ID
export const fetchEventById = createAsyncThunk(
  "crmEvents/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/crm-events/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// CREATE New Event
export const createEvent = createAsyncThunk(
  "crmEvents/create",
  async (eventData, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/crm-events`, eventData, {
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
            message: `Event '${response.data.event_name || ""}' created by ${userName}`,
            link: `/crm-events/${response.data._id}`,
            section: "crmEvents",
            data: {
              action: "CREATE",
              event_id: response.data._id,
              event_name: response.data.event_name,
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

// UPDATE Existing Event
export const updateEvent = createAsyncThunk(
  "crmEvents/update",
  async ({ id, updates }, { dispatch, rejectWithValue }) => {
    try {
      const userStr = sessionStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = sessionStorage.getItem("user_id") || user._id;
      const userName = user.name || "User";

      const response = await axios.put(`${BASE_URL}/crm-events/${id}`, updates, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Event '${response.data.event_name || updates.event_name || id}' updated by ${userName}`,
            link: `/crm-events/${id}`,
            section: "crmEvents",
            data: {
              action: "UPDATE",
              event_id: id,
              event_name: response.data.event_name || updates.event_name,
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

// DELETE Event
export const deleteEvent = createAsyncThunk(
  "crmEvents/delete",
  async (id, { dispatch, getState, rejectWithValue }) => {
    try {
      const { events } = getState().crmEvents;
      const eventToDelete = events.find((e) => e._id === id);

      await axios.delete(`${BASE_URL}/crm-events/${id}`, {
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
            message: `Event '${eventToDelete?.event_name || id}' deleted by ${userName}`,
            link: `/crm-events`,
            section: "crmEvents",
            data: {
              action: "DELETE",
              event_id: id,
              event_name: eventToDelete?.event_name,
              deleted_data: eventToDelete || {},
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
  events: [],
  loading: false,
  error: null,
};

const crmEventSlice = createSlice({
  name: "crmEvents",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Single Event
      .addCase(fetchEventById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.events.findIndex(
          (e) => e._id === action.payload._id,
        );
        if (index !== -1) {
          state.events[index] = action.payload;
        } else {
          state.events.push(action.payload);
        }
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events.push(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.events.findIndex(
          (event) => event._id === action.payload._id,
        );
        if (index !== -1) state.events[index] = action.payload;
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events = state.events.filter((e) => e._id !== action.payload);
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = crmEventSlice.actions;
export default crmEventSlice.reducer;
