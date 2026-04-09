import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { createActivityLogThunk } from "../activityLog/activityLogSlice";

const getUserInfo = () => {
  const userStr = sessionStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  return {
    userId: sessionStorage.getItem("user_id") || user._id,
    userName: user.name || "User",
  };
};

// Base API URL (.env file se)
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// 1️⃣ GET all users
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/users`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 2️⃣ GET single user by ID
export const fetchUserById = createAsyncThunk(
  "users/fetchUserById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/users/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 3️⃣ CREATE user
export const createUser = createAsyncThunk(
  "users/createUser",
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/users`, userData);
      const { userId, userName } = getUserInfo();

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Admin User '${userData.user_fullname}' created by ${userName}`,
            section: "Admin Management",
            data: {
              action: "CREATE",
              new_user: userData.user_fullname,
              role: userData.user_role
            }
          })
        );
      }
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 4️⃣ UPDATE user
export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, updates }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/users/${id}`, updates);
      const { userId, userName } = getUserInfo();

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Admin User '${updates.user_fullname || id}' updated by ${userName}`,
            section: "Admin Management",
            data: {
              action: "UPDATE",
              user_id: id,
              updates: updates
            }
          })
        );
      }
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 5️⃣ DELETE user
export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, { dispatch, getState, rejectWithValue }) => {
    try {
      const { users } = getState().users;
      const userToDelete = users.find(u => u._id === id);

      await axios.delete(`${BASE_URL}/users/${id}`);
      const { userId, userName } = getUserInfo();

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Admin User '${userToDelete?.user_fullname || id}' deleted by ${userName}`,
            section: "Admin Management",
            data: {
              action: "DELETE",
              user_id: id,
              user_name: userToDelete?.user_fullname
            }
          })
        );
      }
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// -----------------------------
// 🔹 Initial State
// -----------------------------
const initialState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
  success: false,
};

// -----------------------------
// 🔹 Slice
// -----------------------------
const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🟢 FETCH ALL USERS
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🟢 FETCH USER BY ID
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🟢 CREATE USER
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
        state.success = true;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🟢 UPDATE USER
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(
          (u) => u._id === action.payload._id
        );
        if (index !== -1) state.users[index] = action.payload;
        state.success = true;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🟢 DELETE USER
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((u) => u._id !== action.payload);
        state.success = true;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = userSlice.actions;

export default userSlice.reducer;
