import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ Backend API Base URL
// const BASE_URL = "http://localhost:5000/api/payments";
const BASE_URL = import.meta.env.VITE_API_URL;

// ========================
// 🟢 CREATE PAYMENT
// ========================
export const createPayment = createAsyncThunk(
  "payment/create",
  async (paymentData, thunkAPI) => {
    try {
      const response = await axios.post(`${BASE_URL}/payments`, paymentData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ========================
// 🟡 GET ALL PAYMENTS
// ========================
export const fetchPayments = createAsyncThunk(
  "payment/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${BASE_URL}/payments`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🔵 GET SINGLE PAYMENT
export const fetchPaymentById = createAsyncThunk(
  "payment/fetchById",
  async (id, thunkAPI) => {
    try {
      const response = await axios.get(`${BASE_URL}/payments/${id}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🟠 UPDATE PAYMENT

export const updatePayment = createAsyncThunk(
  "payment/update",
  async ({ id, updatedData }, thunkAPI) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/payments/${id}`,
        updatedData
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🔴 DELETE PAYMENT

export const deletePayment = createAsyncThunk(
  "payment/delete",
  async (id, thunkAPI) => {
    try {
      const response = await axios.delete(`${BASE_URL}/payments/${id}`);
      return { id, message: response.data.message };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);


// ⚙️ SLICE
// ========================
const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    payments: [],
    currentPayment: null,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // CREATE PAYMENT
    builder
      .addCase(createPayment.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payments.push(action.payload.data);
        state.successMessage = action.payload.message;
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // GET ALL PAYMENTS
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // GET SINGLE PAYMENT
    builder
      .addCase(fetchPaymentById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPaymentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
      })
      .addCase(fetchPaymentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // UPDATE PAYMENT
    builder
      .addCase(updatePayment.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        const index = state.payments.findIndex(
          (p) => p._id === action.payload.data._id
        );
        if (index !== -1) state.payments[index] = action.payload.data;
      })
      .addCase(updatePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // DELETE PAYMENT
    builder
      .addCase(deletePayment.pending, (state) => {
        state.loading = true;
      })
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.payments = state.payments.filter(
          (p) => p._id !== action.payload.id
        );
      })
      .addCase(deletePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages } = paymentSlice.actions;
export default paymentSlice.reducer;
