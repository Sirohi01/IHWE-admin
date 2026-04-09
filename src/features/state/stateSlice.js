import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/api";

// FETCH all states
export const fetchStates = createAsyncThunk(
  "states/fetchStates",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/crm-states");
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// FETCH state by ID
export const fetchStateById = createAsyncThunk(
  "states/fetchStateById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/crm-states/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// CREATE state
export const createState = createAsyncThunk(
  "states/createState",
  async (stateData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/crm-states", stateData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// UPDATE state
export const updateState = createAsyncThunk(
  "states/updateState",
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/crm-states/${id}`, updates);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// DELETE state
export const deleteState = createAsyncThunk(
  "states/deleteState",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/crm-states/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

const initialState = {
  states: [],
  loading: false,
  error: null,
};

const stateSlice = createSlice({
  name: "states",
  initialState,
  reducers: {
    clearStateError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.loading = false;
        state.states = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data || [];
      })
      .addCase(fetchStates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createState.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data || action.payload;
        if (data?._id) state.states.push(data);
      })
      .addCase(updateState.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data || action.payload;
        if (!data?._id) return;
        const index = state.states.findIndex((s) => s._id === data._id);
        if (index !== -1) state.states[index] = data;
      })
      .addCase(deleteState.fulfilled, (state, action) => {
        state.loading = false;
        state.states = state.states.filter((s) => s._id !== action.payload);
      });
  },
});

export const { clearStateError } = stateSlice.actions;
export default stateSlice.reducer;
