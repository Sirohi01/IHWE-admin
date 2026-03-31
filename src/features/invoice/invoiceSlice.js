import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ API Base URL (change as per your setup)
// || "http://localhost:5000/api/invoice";
const BASE_URL = import.meta.env.VITE_API_URL;

// 📍 GET All Invoices
export const fetchInvoices = createAsyncThunk(
  "invoice/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${BASE_URL}/invoices`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 📍 GET Single Invoice by ID
export const fetchInvoiceById = createAsyncThunk(
  "invoice/fetchById",
  async (id, thunkAPI) => {
    try {
      const response = await axios.get(`${BASE_URL}/invoices/${id}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 📍 CREATE Invoice
export const createInvoice = createAsyncThunk(
  "invoice/create",
  async (invoiceData, thunkAPI) => {
    try {
      const response = await axios.post(`${BASE_URL}/invoices`, invoiceData);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 📍 UPDATE Invoice
export const updateInvoice = createAsyncThunk(
  "invoice/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await axios.put(`${BASE_URL}/invoices/${id}`, data);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 📍 DELETE Invoice
export const deleteInvoice = createAsyncThunk(
  "invoice/delete",
  async (id, thunkAPI) => {
    try {
      await axios.delete(`${BASE_URL}/invoices/${id}`);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const invoiceSlice = createSlice({
  name: "invoice",
  initialState: {
    invoices: [],
    currentInvoice: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearInvoiceState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔹 Fetch All
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Fetch by ID
      .addCase(fetchInvoiceById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInvoiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInvoice = action.payload;
      })
      .addCase(fetchInvoiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Create
      .addCase(createInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.invoices.unshift(action.payload); // add to top
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Update
      .addCase(updateInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.invoices.findIndex(
          (i) => i._id === action.payload._id
        );
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Delete
      .addCase(deleteInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.invoices = state.invoices.filter((i) => i._id !== action.payload);
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearInvoiceState } = invoiceSlice.actions;
export default invoiceSlice.reducer;
