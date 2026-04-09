import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../lib/api";

// ================= FETCH =================
export const fetchCountries = createAsyncThunk(
  "countries/fetchCountries",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/crm-countries");
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// ================= SLICE =================
const initialState = {
  countries: [],
  loading: false,
  error: null,
};

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
      // FETCH
      .addCase(fetchCountries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.loading = false;
        // ✅ Handle data structure safely
        state.countries = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data || [];
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCountryError } = countrySlice.actions;
export default countrySlice.reducer;
