// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";

// // const BASE_URL = "http://localhost:5000/api/crm-exhibator-reviews";
// const BASE_URL = import.meta.env.VITE_API_URL;

// // ➤ Async thunks

// // Get all reviews
// export const fetchReviews = createAsyncThunk(
//   "reviews/fetchAll",
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await axios.get(`${BASE_URL}/crm-exhibator-reviews`);
//       return res.data;
//     } catch (err) {
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // Get review by ID
// export const fetchReviewById = createAsyncThunk(
//   "reviews/fetchById",
//   async (id, { rejectWithValue }) => {
//     try {
//       const res = await axios.get(`${BASE_URL}/crm-exhibator-reviews/${id}`);
//       return res.data;
//     } catch (err) {
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // Create review
// export const createReview = createAsyncThunk(
//   "reviews/create",
//   async (reviewData, { rejectWithValue }) => {
//     try {
//       const res = await axios.post(
//         `${BASE_URL}/crm-exhibator-reviews`,
//         reviewData
//       );
//       return res.data;
//     } catch (err) {
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // Update review
// export const updateReview = createAsyncThunk(
//   "reviews/update",
//   async ({ id, reviewData }, { rejectWithValue }) => {
//     try {
//       const res = await axios.put(
//         `${BASE_URL}/crm-exhibator-reviews/${id}`,
//         reviewData
//       );
//       return res.data;
//     } catch (err) {
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // Delete review
// export const deleteReview = createAsyncThunk(
//   "reviews/delete",
//   async (id, { rejectWithValue }) => {
//     try {
//       const res = await axios.delete(`${BASE_URL}/crm-exhibator-reviews/${id}`);
//       return { id, message: res.data.message };
//     } catch (err) {
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // ➤ Slice
// const crmExhibatorReviewSlice = createSlice({
//   name: "reviews",
//   initialState: {
//     reviews: [],
//     review: null,
//     loading: false,
//     error: null,
//     success: null,
//   },
//   reducers: {
//     clearState: (state) => {
//       state.loading = false;
//       state.error = null;
//       state.success = null;
//       state.review = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Fetch all
//       .addCase(fetchReviews.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchReviews.fulfilled, (state, action) => {
//         state.loading = false;
//         state.reviews = action.payload;
//       })
//       .addCase(fetchReviews.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // Fetch by ID
//       .addCase(fetchReviewById.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchReviewById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.review = action.payload;
//       })
//       .addCase(fetchReviewById.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // Create
//       .addCase(createReview.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(createReview.fulfilled, (state, action) => {
//         state.loading = false;
//         state.reviews.push(action.payload.data);
//         state.success = action.payload.message;
//       })
//       .addCase(createReview.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // Update
//       .addCase(updateReview.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateReview.fulfilled, (state, action) => {
//         state.loading = false;
//         state.reviews = state.reviews.map((r) =>
//           r._id === action.payload.data._id ? action.payload.data : r
//         );
//         state.success = action.payload.message;
//       })
//       .addCase(updateReview.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // Delete
//       .addCase(deleteReview.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(deleteReview.fulfilled, (state, action) => {
//         state.loading = false;
//         state.reviews = state.reviews.filter(
//           (r) => r._id !== action.payload.id
//         );
//         state.success = action.payload.message;
//       })
//       .addCase(deleteReview.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { clearState } = crmExhibatorReviewSlice.actions;
// export default crmExhibatorReviewSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { createActivityLogThunk } from "../activityLog/activityLogSlice";

const BASE_URL = import.meta.env.VITE_API_URL;

// ─── Helper ───────────────────────────────────────────────────────────────────

const getUserInfo = () => {
  const userStr = sessionStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  return {
    userId: sessionStorage.getItem("user_id") || user._id,
    userName: user.name || "User",
  };
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

// Get all reviews
export const fetchReviews = createAsyncThunk(
  "reviews/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/crm-exhibator-reviews`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Get review by ID
export const fetchReviewById = createAsyncThunk(
  "reviews/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/crm-exhibator-reviews/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Create review
export const createReview = createAsyncThunk(
  "reviews/create",
  async (reviewData, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/crm-exhibator-reviews`,
        reviewData,
      );

      const { userId, userName } = getUserInfo();

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Exhibitor review for '${res.data.data?.visitor_id || res.data.data?.exhibitor_id || ""}' created by ${userName}`,
            link: `/crm-exhibator-reviews/${res.data.data?._id}`,
            section: "crmExhibatorReviews",
            data: {
              action: "CREATE",
              review_id: res.data.data?._id,
              visitor_id: res.data.data?.visitor_id,
              created_data: res.data.data,
            },
          }),
        );
      }

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Update review
export const updateReview = createAsyncThunk(
  "reviews/update",
  async ({ id, reviewData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.put(
        `${BASE_URL}/crm-exhibator-reviews/${id}`,
        reviewData,
      );

      const { userId, userName } = getUserInfo();

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Exhibitor review '${id}' updated by ${userName}`,
            link: `/crm-exhibator-reviews/${id}`,
            section: "crmExhibatorReviews",
            data: {
              action: "UPDATE",
              review_id: id,
              updated_fields: reviewData,
              updated_data: res.data.data,
            },
          }),
        );
      }

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Delete review
export const deleteReview = createAsyncThunk(
  "reviews/delete",
  async (id, { dispatch, getState, rejectWithValue }) => {
    try {
      const { reviews } = getState().reviews;
      const reviewToDelete = reviews.find((r) => r._id === id);

      const res = await axios.delete(`${BASE_URL}/crm-exhibator-reviews/${id}`);

      const { userId, userName } = getUserInfo();

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Exhibitor review '${reviewToDelete?.visitor_id || id}' deleted by ${userName}`,
            link: `/crm-exhibator-reviews`,
            section: "crmExhibatorReviews",
            data: {
              action: "DELETE",
              review_id: id,
              deleted_data: reviewToDelete || {},
            },
          }),
        );
      }

      return { id, message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// ─── Slice ─────────────────────────────────────────────────────────────────────

const crmExhibatorReviewSlice = createSlice({
  name: "reviews",
  initialState: {
    reviews: [],
    review: null,
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = null;
      state.review = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch by ID
      .addCase(fetchReviewById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviewById.fulfilled, (state, action) => {
        state.loading = false;
        state.review = action.payload;
      })
      .addCase(fetchReviewById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.push(action.payload.data);
        state.success = action.payload.message;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = state.reviews.map((r) =>
          r._id === action.payload.data._id ? action.payload.data : r,
        );
        state.success = action.payload.message;
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = state.reviews.filter(
          (r) => r._id !== action.payload.id,
        );
        state.success = action.payload.message;
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearState } = crmExhibatorReviewSlice.actions;
export default crmExhibatorReviewSlice.reducer;