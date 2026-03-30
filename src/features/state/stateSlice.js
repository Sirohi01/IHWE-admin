import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base API URL
// const API_URL = "http://localhost:5000/api/crm-states";
const BASE_URL = import.meta.env.VITE_API_URL;

// FETCH all states
export const fetchStates = createAsyncThunk(
  "states/fetchStates",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/crm-states`);
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
      const response = await axios.get(`${BASE_URL}/crm-states/${id}`);
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
      const response = await axios.post(`${BASE_URL}/crm-states`, stateData);
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
      const response = await axios.put(`${BASE_URL}/crm-states/${id}`, updates);
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
      await axios.delete(`${BASE_URL}/crm-states/${id}`);
      return id; // return deleted id for state update
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// **Initial State**
const initialState = {
  states: [],
  loading: false,
  error: null,
};

// **Slice**
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
      // FETCH ALL
      .addCase(fetchStates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.loading = false;
        state.states = action.payload.data;
      })
      .addCase(fetchStates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // CREATE
      .addCase(createState.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createState.fulfilled, (state, action) => {
        state.loading = false;
        state.states.push(action.payload);
      })
      .addCase(createState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // UPDATE
      .addCase(updateState.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateState.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.states.findIndex(
          (s) => s._id === action.payload._id,
        );
        if (index !== -1) state.states[index] = action.payload;
      })
      .addCase(updateState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteState.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteState.fulfilled, (state, action) => {
        state.loading = false;
        state.states = state.states.filter((s) => s._id !== action.payload);
      })
      .addCase(deleteState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStateError } = stateSlice.actions;

export default stateSlice.reducer;
