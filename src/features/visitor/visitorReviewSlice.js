import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { createActivityLogThunk } from "../activityLog/activityLogSlice";

const BASE_URL = import.meta.env.VITE_API_URL;

// ─── Helper ───────────────────────────────────────────────────────────────────

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
});

const getUserInfo = () => {
  const userStr = sessionStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  return {
    userId: sessionStorage.getItem("user_id") || user._id,
    userName: user.name || "User",
  };
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

// GET All Reviews
export const fetchVisitorReviews = createAsyncThunk(
  "visitorReview/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/visitor-reviews`, {
        headers: getAuthHeaders(),
      });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// GET Reviews by Visitor ID
export const fetchReviewsByVisitorId = createAsyncThunk(
  "visitorReview/fetchByVisitorId",
  async (visitor_id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/visitor-reviews/visitor/${visitor_id}`,
        { headers: getAuthHeaders() },
      );
      return response.data.data ?? [];
    } catch (err) {
      if (err.response?.status === 404) return [];
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// GET Single Review by ID
export const fetchVisitorReviewById = createAsyncThunk(
  "visitorReview/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/visitor-reviews/${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data.data ?? [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// CREATE Review
export const createVisitorReview = createAsyncThunk(
  "visitorReview/create",
  async (reviewData, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/visitor-reviews`,
        reviewData,
        { headers: getAuthHeaders() },
      );

      const { userId, userName } = getUserInfo();

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Visitor review for '${response.data.data?.visitor_id || ""}' created by ${userName}`,
            link: `/visitor-reviews/${response.data.data?._id}`,
            section: "visitorReview",
            data: {
              action: "CREATE",
              review_id: response.data.data?._id,
              visitor_id: response.data.data?.visitor_id,
              created_data: response.data.data,
            },
          }),
        );
      }

      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// UPDATE Review
export const updateVisitorReview = createAsyncThunk(
  "visitorReview/update",
  async ({ id, updates }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/visitor-reviews/${id}`,
        updates,
        { headers: getAuthHeaders() },
      );

      const { userId, userName } = getUserInfo();

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Visitor review '${id}' updated by ${userName}`,
            link: `/visitor-reviews/${id}`,
            section: "visitorReview",
            data: {
              action: "UPDATE",
              review_id: id,
              visitor_id: response.data.data?.visitor_id,
              updated_fields: updates,
              updated_data: response.data.data,
            },
          }),
        );
      }

      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// DELETE Review
export const deleteVisitorReview = createAsyncThunk(
  "visitorReview/delete",
  async (id, { dispatch, getState, rejectWithValue }) => {
    try {
      const { reviews } = getState().visitorReview;
      const reviewToDelete = reviews.find((r) => r._id === id);

      await axios.delete(`${BASE_URL}/visitor-reviews/${id}`, {
        headers: getAuthHeaders(),
      });

      const { userId, userName } = getUserInfo();

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Visitor review for '${reviewToDelete?.visitor_id || id}' deleted by ${userName}`,
            link: `/visitor-reviews`,
            section: "visitorReview",
            data: {
              action: "DELETE",
              review_id: id,
              visitor_id: reviewToDelete?.visitor_id,
              deleted_data: reviewToDelete || {},
            },
          }),
        );
      }

      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// ─── Initial State ─────────────────────────────────────────────────────────────

const initialState = {
  reviews: [],
  visitorReviews: [],
  selectedReview: null,
  loading: false,
  error: null,
};

// ─── Slice ─────────────────────────────────────────────────────────────────────

const visitorReviewSlice = createSlice({
  name: "visitorReview",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedReview: (state) => {
      state.selectedReview = null;
    },
    clearVisitorReviews: (state) => {
      state.visitorReviews = [];
    },
  },
  extraReducers: (builder) => {
    builder

      // ── Fetch All ──
      .addCase(fetchVisitorReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVisitorReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchVisitorReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Fetch By Visitor ID ──
      .addCase(fetchReviewsByVisitorId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviewsByVisitorId.fulfilled, (state, action) => {
        state.loading = false;
        state.visitorReviews = action.payload;
      })
      .addCase(fetchReviewsByVisitorId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Fetch By ID ──
      .addCase(fetchVisitorReviewById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVisitorReviewById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedReview = action.payload;
        const index = state.reviews.findIndex(
          (r) => r._id === action.payload._id,
        );
        if (index !== -1) {
          state.reviews[index] = action.payload;
        } else {
          state.reviews.push(action.payload);
        }
      })
      .addCase(fetchVisitorReviewById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Create ──
      .addCase(createVisitorReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVisitorReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.unshift(action.payload);
      })
      .addCase(createVisitorReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Update ──
      .addCase(updateVisitorReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVisitorReview.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.reviews.findIndex(
          (r) => r._id === action.payload._id,
        );
        if (index !== -1) state.reviews[index] = action.payload;
        const vIndex = state.visitorReviews.findIndex(
          (r) => r._id === action.payload._id,
        );
        if (vIndex !== -1) state.visitorReviews[vIndex] = action.payload;
        if (state.selectedReview?._id === action.payload._id) {
          state.selectedReview = action.payload;
        }
      })
      .addCase(updateVisitorReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Delete ──
      .addCase(deleteVisitorReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVisitorReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = state.reviews.filter((r) => r._id !== action.payload);
        state.visitorReviews = state.visitorReviews.filter(
          (r) => r._id !== action.payload,
        );
        if (state.selectedReview?._id === action.payload) {
          state.selectedReview = null;
        }
      })
      .addCase(deleteVisitorReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedReview, clearVisitorReviews } =
  visitorReviewSlice.actions;

export default visitorReviewSlice.reducer;
