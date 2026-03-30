import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base API URL
// const API_URL = "http://localhost:5000/api/crm-cities";
const BASE_URL = import.meta.env.VITE_API_URL;

// FETCH all cities
export const fetchCities = createAsyncThunk(
  "cities/fetchCities",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/crm-cities`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// FETCH city by ID
export const fetchCityById = createAsyncThunk(
  "cities/fetchCityById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/crm-cities/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// CREATE city
export const createCity = createAsyncThunk(
  "cities/createCity",
  async (cityData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/crm-cities`, cityData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// UPDATE city
export const updateCity = createAsyncThunk(
  "cities/updateCity",
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/crm-cities/${id}`, updates);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// DELETE city
export const deleteCity = createAsyncThunk(
  "cities/deleteCity",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/crm-cities/${id}`);
      return id; // return deleted id for state update
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// **Initial State**
const initialState = {
  cities: [],
  loading: false,
  error: null,
};

// **Slice**
const citySlice = createSlice({
  name: "cities",
  initialState,
  reducers: {
    clearCityError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH ALL
      .addCase(fetchCities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = action.payload.data;
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // CREATE
      .addCase(createCity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCity.fulfilled, (state, action) => {
        state.loading = false;
        state.cities.push(action.payload);
      })
      .addCase(createCity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // UPDATE
      .addCase(updateCity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCity.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.cities.findIndex(
          (c) => c._id === action.payload._id
        );
        if (index !== -1) state.cities[index] = action.payload;
      })
      .addCase(updateCity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteCity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCity.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = state.cities.filter((c) => c._id !== action.payload);
      })
      .addCase(deleteCity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCityError } = citySlice.actions;

export default citySlice.reducer;
