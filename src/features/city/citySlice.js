import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/api";

// FETCH all cities
export const fetchCities = createAsyncThunk(
  "cities/fetchCities",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/crm-cities");
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
      const response = await api.get(`/api/crm-cities/${id}`);
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
      const response = await api.post("/api/crm-cities", cityData);
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
      const response = await api.put(`/api/crm-cities/${id}`, updates);
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
      await api.delete(`/api/crm-cities/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const initialState = {
  cities: [],
  loading: false,
  error: null,
};

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
      .addCase(fetchCities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data || [];
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCity.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data || action.payload;
        if (data?._id) state.cities.push(data);
      })
      .addCase(updateCity.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data || action.payload;
        if (!data?._id) return;
        const index = state.cities.findIndex((c) => c._id === data._id);
        if (index !== -1) state.cities[index] = data;
      })
      .addCase(deleteCity.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = state.cities.filter((c) => c._id !== action.payload);
      });
  },
});

export const { clearCityError } = citySlice.actions;
export default citySlice.reducer;
