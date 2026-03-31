import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// const API_URL = "http://localhost:5000/api/estimates"; // 🟢 change if needed
const BASE_URL = import.meta.env.VITE_API_URL;

// -------------------- 🧠 Async Thunks --------------------

// ✅ Get all estimates
// export const fetchEstimates = createAsyncThunk(
//   "estimates/fetchAll",
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await axios.get(`${BASE_URL}/estimates`);
//       return res.data;
//     } catch (err) {
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );
// ✅ Get grouped estimates by companyId
export const fetchEstimates = createAsyncThunk(
  "estimates/fetchAll",
  async (companyId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/estimates/grouped/${companyId}`);

      // API returns: { success, count, data: [...] }
      if (res.data.success) {
        return res.data.data;
      } else {
        return rejectWithValue(res.data.message || "Failed to fetch estimates");
      }
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ✅ Get single estimate by ID
export const fetchEstimateById = createAsyncThunk(
  "estimates/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/estimates/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ✅ Add new estimate (auto-generates est_no)
export const addEstimate = createAsyncThunk(
  "estimates/add",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASE_URL}/estimates`, formData);
      return res.data.data; // since backend returns {message, data: estimate}
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ✅ Update estimate
export const updateEstimate = createAsyncThunk(
  "estimates/update",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BASE_URL}/estimates/${id}`, updatedData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ✅ Delete estimate
export const deleteEstimate = createAsyncThunk(
  "estimates/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/estimates/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ✅ Get next estimate number (for display on form)
export const fetchNextEstimateNo = createAsyncThunk(
  "estimates/fetchNextNo",
  async (_, { rejectWithValue }) => {
    try {
      // Assuming your new route is /api/estimates/next-number
      const res = await axios.get(`${BASE_URL}/estimates/next-number`);
      return res.data.est_no;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// -------------------- 🧩 Slice --------------------

const estimateSlice = createSlice({
  name: "estimates",
  initialState: {
    estimates: [],
    selectedEstimate: null,
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearEstimateState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // 🔹 FETCH ALL
      .addCase(fetchEstimates.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEstimates.fulfilled, (state, action) => {
        state.loading = false;
        state.estimates = action.payload || [];
      })
      .addCase(fetchEstimates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 FETCH BY ID
      .addCase(fetchEstimateById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEstimateById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEstimate = action.payload;
      })
      .addCase(fetchEstimateById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 ADD
      .addCase(addEstimate.pending, (state) => {
        state.loading = true;
      })
      .addCase(addEstimate.fulfilled, (state, action) => {
        state.loading = false;
        state.estimates.unshift(action.payload);
        state.success = "Estimate added successfully!";
      })
      .addCase(addEstimate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 UPDATE
      .addCase(updateEstimate.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateEstimate.fulfilled, (state, action) => {
        state.loading = false;
        state.estimates = state.estimates.map((est) =>
          est._id === action.payload._id ? action.payload : est,
        );
        state.success = "Estimate updated successfully!";
      })
      .addCase(updateEstimate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 DELETE
      .addCase(deleteEstimate.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteEstimate.fulfilled, (state, action) => {
        state.loading = false;
        state.estimates = state.estimates.filter(
          (est) => est._id !== action.payload,
        );
        state.success = "Estimate deleted successfully!";
      })
      .addCase(deleteEstimate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 FETCH NEXT ESTIMATE NUMBER
      .addCase(fetchNextEstimateNo.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNextEstimateNo.fulfilled, (state, action) => {
        state.loading = false;
        state.nextEstimateNo = action.payload;
      })
      .addCase(fetchNextEstimateNo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearEstimateState } = estimateSlice.actions;
export default estimateSlice.reducer;
