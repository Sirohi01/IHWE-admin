import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { createActivityLogThunk } from "../../activityLog/activityLogSlice";

const BASE_URL = import.meta.env.VITE_API_URL;

// **Async Thunks**

// GET all categories
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/crm-exhibitor-categories`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// GET category by ID
export const fetchCategoryById = createAsyncThunk(
  "categories/fetchCategoryById",
  async (id, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/crm-exhibitor-categories/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// CREATE category
export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (categoryData, { dispatch, rejectWithValue }) => {
    const token = sessionStorage.getItem("token");
    if (!token) return rejectWithValue("No token provided");
    try {
      const response = await axios.post(
        `${BASE_URL}/crm-exhibitor-categories`,
        categoryData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Get user info securely from sessionStorage
      const userStr = sessionStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = sessionStorage.getItem("user_id") || user._id;
      const userName = user.name || "User";

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Category '${response.data.cat_name}' created by ${userName}`,
            link: `/add-category`,
            section: "Category",
            data: {
              action: "CREATE",
              category_id: response.data._id,
              created_data: response.data,
            },
          }),
        );
      }

      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// UPDATE category
export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ id, updates }, { dispatch, rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.put(
        `${BASE_URL}/crm-exhibitor-categories/${id}`,
        updates,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Log Activity for update
      const userStr = sessionStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = sessionStorage.getItem("user_id") || user._id;
      const userName = user.name || "User";

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Category '${updates.cat_name || response.data.cat_name || id}' updated by ${userName}`,
            link: `/add-category`,
            section: "Category",
            data: {
              action: "UPDATE",
              category_id: id,
              updated_fields: updates,
              updated_data: response.data,
            },
          }),
        );
      }
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// DELETE category
export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (id, { dispatch, getState, rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");

      // Get category details before deleting
      const { categories } = getState().categories;
      const categoryToDelete = categories.find((c) => c._id === id);

      const response = await axios.delete(
        `${BASE_URL}/crm-exhibitor-categories/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Log Activity
      const userStr = sessionStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = sessionStorage.getItem("user_id") || user._id;
      const userName = user.name || "User";

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Category '${categoryToDelete?.cat_name || id}' deleted by ${userName}`,
            link: `/add-category`,
            section: "Category",
            data: {
              action: "DELETE",
              category_id: id,
              deleted_data: categoryToDelete || {},
            },
          }),
        );
      }

      return id; // Return ID to remove from state
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// **Initial State**
const initialState = {
  categories: [],
  loading: false,
  error: null,
};

// **Slice**
const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH ALL
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // CREATE
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // UPDATE
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.categories.findIndex(
          (c) => c._id === action.payload._id,
        );
        if (index !== -1) state.categories[index] = action.payload;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId =
          action.payload?._id || action.payload?.deletedId || action.payload;
        state.categories = state.categories.filter((c) => c._id !== deletedId);
      })

      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCategoryError } = categorySlice.actions;

export default categorySlice.reducer;
