import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../../../lib/api";
import { createActivityLogThunk } from "../../activityLog/activityLogSlice";

const BASE_URL = API_URL;

// FormData lets multer read the QR file alongside the regular fields
const toFormData = (bankData) => {
  const formData = new FormData();
  Object.entries(bankData).forEach(([key, value]) => {
    if (key === "qrCodeFile") {
      if (value instanceof File) formData.append("qrCode", value);
      return;
    }
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      if (value.length === 0) formData.append(key, "");
      else value.forEach((v) => formData.append(key, v));
      return;
    }
    formData.append(key, value);
  });
  return formData;
};

// ✅ Fetch All Banks
export const fetchBanks = createAsyncThunk(
  "banks/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/banks`);
      return response.data.data || response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

// ✅ Add New Bank
export const addBank = createAsyncThunk(
  "banks/create",
  async (bankData, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/banks`, toFormData(bankData), {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const userStr = sessionStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = sessionStorage.getItem("user_id") || user._id;
      const userName = user.name || "User";

      const created = response.data.data || response.data;

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Bank '${created.accountDisplayName || created.bankname || ""}' created by ${userName}`,
            link: `/banks`,
            section: "banks",
            data: {
              action: "CREATE",
              bank_id: created._id,
              bank_name: created.accountDisplayName || created.bankname,
              created_data: created,
            },
          }),
        );
      }

      return created;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

// ✅ Update Existing Bank
export const updateBank = createAsyncThunk(
  "banks/update",
  async ({ id, updatedData }, { dispatch, rejectWithValue }) => {
    try {

      const userStr = sessionStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = sessionStorage.getItem("user_id") || user._id;
      const userName = user.name || "User";

      // ✅ updated_by add karo
      const dataWithUser = {
        ...updatedData,
        updated_by: userId || null,
      };

      const response = await axios.put(
        `${BASE_URL}/banks/${id}`,
        toFormData(dataWithUser),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const updated = response.data.data || response.data;

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Bank '${updated.accountDisplayName || updated.bankname || updatedData.accountDisplayName || id}' updated by ${userName}`,
            link: `/banks`,
            section: "banks",
            data: {
              action: "UPDATE",
              bank_id: id,
              bank_name: updated.accountDisplayName || updated.bankname,
              updated_fields: updatedData,
              updated_data: updated,
            },
          }),
        );
      }

      return updated;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

// ✅ Delete Bank
export const deleteBank = createAsyncThunk(
  "banks/delete",
  async (id, { dispatch, getState, rejectWithValue }) => {
    try {

      const { banks } = getState().banks;
      const bankToDelete = banks.find((b) => b._id === id);

      await axios.delete(`${BASE_URL}/banks/${id}`);

      const userStr = sessionStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = sessionStorage.getItem("user_id") || user._id;
      const userName = user.name || "User";

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Bank '${bankToDelete?.accountDisplayName || bankToDelete?.bankname || id}' deleted by ${userName}`,
            link: `/banks`,
            section: "banks",
            data: {
              action: "DELETE",
              bank_id: id,
              bank_name: bankToDelete?.accountDisplayName || bankToDelete?.bankname,
              deleted_data: bankToDelete || {},
            },
          }),
        );
      }

      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

const initialState = {
  banks: [],
  loading: false,
  error: null,
};

const bankSlice = createSlice({
  name: "banks",
  initialState,
  reducers: {
    clearBankError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchBanks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanks.fulfilled, (state, action) => {
        state.loading = false;
        state.banks = action.payload;
      })
      .addCase(fetchBanks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(addBank.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBank.fulfilled, (state, action) => {
        state.loading = false;
        state.banks.push(action.payload);
      })
      .addCase(addBank.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateBank.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBank.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.banks.findIndex(
          (bank) => bank._id === action.payload._id,
        );
        if (index !== -1) state.banks[index] = action.payload;
      })
      .addCase(updateBank.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteBank.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBank.fulfilled, (state, action) => {
        state.loading = false;
        state.banks = state.banks.filter((bank) => bank._id !== action.payload);
      })
      .addCase(deleteBank.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBankError } = bankSlice.actions;
export default bankSlice.reducer;
