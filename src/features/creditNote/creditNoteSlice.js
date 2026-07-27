import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/api";

const normalizeCreditNotes = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.creditNotes)) return payload.creditNotes;
  return [];
};

const normalizeCreditNote = (payload) => payload?.data || payload || null;

export const createCreditNote = createAsyncThunk(
  "creditnotes/create",
  async (creditNoteData, thunkAPI) => {
    try {
      const response = await api.post(`/api/creditnotes`, creditNoteData);
      return normalizeCreditNote(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCreditNotes = createAsyncThunk(
  "creditnotes/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await api.get(`/api/creditnotes`);
      return normalizeCreditNotes(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCreditNoteById = createAsyncThunk(
  "creditnotes/fetchById",
  async (id, thunkAPI) => {
    try {
      const response = await api.get(`/api/creditnotes/${id}`);
      return normalizeCreditNote(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCreditNote = createAsyncThunk(
  "creditnotes/update",
  async ({ id, updatedData }, thunkAPI) => {
    try {
      const response = await api.put(`/api/creditnotes/${id}`, updatedData);
      return normalizeCreditNote(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCreditNote = createAsyncThunk(
  "creditnotes/delete",
  async (id, thunkAPI) => {
    try {
      await api.delete(`/api/creditnotes/${id}`);
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
        if (action.payload) state.creditNotes.push(action.payload);
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
        state.creditNotes = normalizeCreditNotes(action.payload);
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
        if (!action.payload) return;
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
