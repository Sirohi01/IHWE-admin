import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base API URL
// const API_URL = "http://localhost:5000/api/crm-countries";
const BASE_URL = import.meta.env.VITE_API_URL;

// **Async Thunks**

// FETCH all countries
export const fetchCountries = createAsyncThunk(
  "countries/fetchCountries",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/crm-countries`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// FETCH country by ID
export const fetchCountryById = createAsyncThunk(
  "countries/fetchCountryById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/crm-countries/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// CREATE country
export const createCountry = createAsyncThunk(
  "countries/createCountry",
  async (countryData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/crm-countries`,
        countryData,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// UPDATE country
export const updateCountry = createAsyncThunk(
  "countries/updateCountry",
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/crm-countries/${id}`,
        updates,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// DELETE country
export const deleteCountry = createAsyncThunk(
  "countries/deleteCountry",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/crm-countries/${id}`);
      return id; // return deleted id for state update
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// **Initial State**
const initialState = {
  countries: [],
  loading: false,
  error: null,
};

// **Slice**
const countrySlice = createSlice({
  name: "countries",
  initialState,
  reducers: {
    clearCountryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH ALL
      .addCase(fetchCountries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.loading = false;
        state.countries = action.payload.data;
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // CREATE
      .addCase(createCountry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCountry.fulfilled, (state, action) => {
        state.loading = false;
        state.countries.push(action.payload);
      })
      .addCase(createCountry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // UPDATE
      .addCase(updateCountry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCountry.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.countries.findIndex(
          (c) => c._id === action.payload._id,
        );
        if (index !== -1) state.countries[index] = action.payload;
      })
      .addCase(updateCountry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteCountry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCountry.fulfilled, (state, action) => {
        state.loading = false;
        state.countries = state.countries.filter(
          (c) => c._id !== action.payload,
        );
      })
      .addCase(deleteCountry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCountryError } = countrySlice.actions;

export default countrySlice.reducer;
