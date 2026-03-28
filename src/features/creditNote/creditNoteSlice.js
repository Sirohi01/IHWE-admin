import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 🧾 Base URL
const BASE_URL = import.meta.env.VITE_API_URL;

export const createCreditNote = createAsyncThunk(
  "creditnotes/create",
  async (creditNoteData, thunkAPI) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/creditnotes`,
        creditNoteData
      );
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCreditNotes = createAsyncThunk(
  "creditnotes/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${BASE_URL}/creditnotes`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCreditNoteById = createAsyncThunk(
  "creditnotes/fetchById",
  async (id, thunkAPI) => {
    try {
      const response = await axios.get(`${BASE_URL}/creditnotes/${id}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCreditNote = createAsyncThunk(
  "creditnotes/update",
  async ({ id, updatedData }, thunkAPI) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/creditnotes/${id}`,
        updatedData
      );
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCreditNote = createAsyncThunk(
  "creditnotes/delete",
  async (id, thunkAPI) => {
    try {
      await axios.delete(`${BASE_URL}/creditnotes/${id}`);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const creditNoteSlice = createSlice({
  name: "creditnotes",
  initialState: {
    creditNotes: [],
    selectedCreditNote: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearCreditNoteState: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(createCreditNote.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(createCreditNote.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.creditNotes.push(action.payload);
      })
      .addCase(createCreditNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FETCH ALL
      .addCase(fetchCreditNotes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCreditNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.creditNotes = action.payload;
      })
      .addCase(fetchCreditNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FETCH BY ID
      .addCase(fetchCreditNoteById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCreditNoteById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCreditNote = action.payload;
      })
      .addCase(fetchCreditNoteById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // UPDATE
      .addCase(updateCreditNote.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCreditNote.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.creditNotes = state.creditNotes.map((note) =>
          note._id === action.payload._id ? action.payload : note
        );
      })
      .addCase(updateCreditNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteCreditNote.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCreditNote.fulfilled, (state, action) => {
        state.loading = false;
        state.creditNotes = state.creditNotes.filter(
          (note) => note._id !== action.payload
        );
      })
      .addCase(deleteCreditNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCreditNoteState } = creditNoteSlice.actions;
export default creditNoteSlice.reducer;
