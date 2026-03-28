import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// NOTE: Since VITE_API_URL is not defined in this environment, it's assumed to be available at runtime.
const BASE_URL = import.meta.env.VITE_API_URL;

// 🟢 CREATE (Add new Performa Invoice)
export const createPerformaInvoice = createAsyncThunk(
  "perinvoice/create",
  async (invoiceData, thunkAPI) => {
    try {
      // Assuming invoiceData contains all necessary fields like est_no, companyId, finalAmount
      const response = await axios.post(`${BASE_URL}/perinvoice`, invoiceData);
      return response.data.data; // Should return the newly created PI object
    } catch (error) {
      // In a real app, use thunkAPI.dispatch(showError(message))
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Error creating invoice"
      );
    }
  }
);

// 🟡 READ (Fetch all invoices)
export const fetchPerformaInvoices = createAsyncThunk(
  "perinvoice/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${BASE_URL}/perinvoice`);
      return response.data; // Assuming response.data is the array of invoices
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Error fetching invoices"
      );
    }
  }
);

// 🟣 READ (Fetch one invoice)
export const fetchPerformaInvoiceById = createAsyncThunk(
  "perinvoice/fetchById",
  async (id, thunkAPI) => {
    try {
      const response = await axios.get(`${BASE_URL}/perinvoice/${id}`);
      return response.data; // Assuming response.data is the single invoice object
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Error fetching invoice"
      );
    }
  }
);

// 🟠 UPDATE
export const updatePerformaInvoice = createAsyncThunk(
  "perinvoice/update",
  async ({ id, updatedData }, thunkAPI) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/perinvoice/${id}`,
        updatedData
      );
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Error updating invoice"
      );
    }
  }
);

// 🔴 DELETE
export const deletePerformaInvoice = createAsyncThunk(
  "perinvoice/delete",
  async (id, thunkAPI) => {
    try {
      await axios.delete(`${BASE_URL}/perinvoice/${id}`);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Error deleting invoice"
      );
    }
  }
);

// 🧠 Slice
const performaInvoiceSlice = createSlice({
  name: "perinvoice",
  initialState: {
    perInvoices: [],
    singleInvoice: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearPerInvoiceState: (state) => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔵 CREATE
      .addCase(createPerformaInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createPerformaInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Prepend the new PI to the list for immediate visibility
        state.perInvoices.unshift(action.payload);
      })
      .addCase(createPerformaInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🟢 FETCH ALL
      .addCase(fetchPerformaInvoices.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPerformaInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.perInvoices = action.payload;
      })
      .addCase(fetchPerformaInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🟣 FETCH ONE
      .addCase(fetchPerformaInvoiceById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPerformaInvoiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.singleInvoice = action.payload;
      })
      .addCase(fetchPerformaInvoiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🟠 UPDATE
      .addCase(updatePerformaInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePerformaInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.perInvoices.findIndex(
          (inv) => inv._id === action.payload._id
        );
        if (index !== -1) state.perInvoices[index] = action.payload;
      })
      .addCase(updatePerformaInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔴 DELETE
      .addCase(deletePerformaInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(deletePerformaInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.perInvoices = state.perInvoices.filter(
          (inv) => inv._id !== action.payload
        );
      })
      .addCase(deletePerformaInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPerInvoiceState } = performaInvoiceSlice.actions;

export default performaInvoiceSlice.reducer;
