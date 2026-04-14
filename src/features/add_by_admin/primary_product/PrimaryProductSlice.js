import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../../../lib/api";
import { createActivityLogThunk } from "../../activityLog/activityLogSlice";

const BASE_URL = API_URL;
// Helper to get user info
const getUserInfo = () => {
    const adminData = JSON.parse(localStorage.getItem('adminInfo') || sessionStorage.getItem('adminInfo') || '{}');
    const userStr = sessionStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : {};
    const userId = adminData._id || adminData.id || sessionStorage.getItem("user_id") || user._id || "admin";
    const userName = adminData.name || adminData.username || user.name || "Admin";
    return { userId, userName };
};

const getPrimaryProductName = (item) =>
    item?.primary_product || item?.primary_product_interest || "";

// ✅ Fetch All Primary Product
export const fetchPrimaryProduct = createAsyncThunk(
    "primaryProduct/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/primary-products`);
            return response.data.data || response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    },
);

// ✅ Add New Primary Product
export const addPrimaryProduct = createAsyncThunk(
    "primaryProduct/create",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/primary-products`, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const { userId, userName } = getUserInfo();

            const created = response.data.data || response.data;

            if (userId) {
                dispatch(
                    createActivityLogThunk({
                        user_id: userId,
                        user: userName,
                        action: "Created",
                        module: "Primary Product",
                        details: `Primary Product '${getPrimaryProductName(created) || getPrimaryProductName(data)}' created`,
                    }),
                );
            }

            return created;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    },
);

// ✅ Update Existing Primary Product
export const updatePrimaryProduct = createAsyncThunk(
    "primaryProduct/update",
    async ({ id, updatedData }, { dispatch, rejectWithValue }) => {
        try {
            const { userId, userName } = getUserInfo();

            const dataWithUser = {
                ...updatedData,
                updated_by: userId || null,
            };

            const response = await axios.put(
                `${BASE_URL}/primary-products/${id}`,
                dataWithUser,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );

            const updated = response.data.data || response.data;

            if (userId) {
                dispatch(
                    createActivityLogThunk({
                        user_id: userId,
                        user: userName,
                        action: "Updated",
                        module: "Primary Product",
                        details: `Primary Product '${getPrimaryProductName(updated) || getPrimaryProductName(updatedData) || id}' updated`,
                    }),
                );
            }

            return updated;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    },
);

// ✅ Delete Primary Product
export const deletePrimaryProduct = createAsyncThunk(
    "primaryProduct/delete",
    async (id, { dispatch, getState, rejectWithValue }) => {
        try {
            const { primaryProduct } = getState().primaryProduct;
            const itemToDelete = primaryProduct.find((b) => b._id === id || b.id === id);

            await axios.delete(`${BASE_URL}/primary-products/${id}`);

            const { userId, userName } = getUserInfo();

            if (userId) {
                dispatch(
                    createActivityLogThunk({
                        user_id: userId,
                        user: userName,
                        action: "Deleted",
                        module: "Primary Product",
                        details: `Primary Product '${getPrimaryProductName(itemToDelete) || id}' deleted`,
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
    primaryProduct: [],
    loading: false,
    error: null,
};

const primaryProductSlice = createSlice({
    name: "primaryProduct",
    initialState,
    reducers: {
        clearPrimaryProductError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchPrimaryProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPrimaryProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.primaryProduct = action.payload;
            })
            .addCase(fetchPrimaryProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create
            .addCase(addPrimaryProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addPrimaryProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.primaryProduct.push(action.payload);
            })
            .addCase(addPrimaryProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update
            .addCase(updatePrimaryProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePrimaryProduct.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.primaryProduct.findIndex(
                    (item) => item._id === action.payload._id || item.id === action.payload.id
                );
                if (index !== -1) state.primaryProduct[index] = action.payload;
            })
            .addCase(updatePrimaryProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete
            .addCase(deletePrimaryProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deletePrimaryProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.primaryProduct = state.primaryProduct.filter(
                    (item) => item._id !== action.payload && item.id !== action.payload
                );
            })
            .addCase(deletePrimaryProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearPrimaryProductError } = primaryProductSlice.actions;
export default primaryProductSlice.reducer;
