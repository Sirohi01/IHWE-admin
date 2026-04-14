import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../../../lib/api";
import { createActivityLogThunk } from "../../activityLog/activityLogSlice";

const BASE_URL = API_URL;

// ✅ Fetch All Business Types
export const fetchBusinessTypes = createAsyncThunk(
    "businessTypes/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/business-types`);
            return response.data.data || response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    },
);

// ✅ Add New Business Type
export const addBusinessType = createAsyncThunk(
    "businessTypes/create",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/business-types`, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const adminData = JSON.parse(localStorage.getItem('adminInfo') || sessionStorage.getItem('adminInfo') || '{}');
            const userId = adminData._id || adminData.id || sessionStorage.getItem("user_id") || 'admin';
            const userName = adminData.name || adminData.username || "Admin";

            const created = response.data.data || response.data;

            if (userId) {
                dispatch(
                    createActivityLogThunk({
                        user_id: userId,
                        user: userName,
                        action: "Created",
                        module: "Business Type",
                        details: `Business Type '${created.business_type || ""}' created`,
                    }),
                );
            }

            return created;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    },
);

// ✅ Update Existing Business Type
export const updateBusinessType = createAsyncThunk(
    "businessTypes/update",
    async ({ id, updatedData }, { dispatch, rejectWithValue }) => {
        try {
            const adminData = JSON.parse(localStorage.getItem('adminInfo') || sessionStorage.getItem('adminInfo') || '{}');
            const userId = adminData._id || adminData.id || sessionStorage.getItem("user_id") || 'admin';
            const userName = adminData.name || adminData.username || "Admin";

            const dataWithUser = {
                ...updatedData,
                updated_by: userId || null,
            };

            const response = await axios.put(
                `${BASE_URL}/business-types/${id}`,
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
                        module: "Business Type",
                        details: `Business Type '${updated.business_type || updatedData.business_type || id}' updated`,
                    }),
                );
            }

            return updated;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    },
);

// ✅ Delete Business Type
export const deleteBusinessType = createAsyncThunk(
    "businessTypes/delete",
    async (id, { dispatch, getState, rejectWithValue }) => {
        try {
            const { businessTypes } = getState().businessTypes;
            const itemToDelete = businessTypes.find((b) => b._id === id || b.id === id);

            await axios.delete(`${BASE_URL}/business-types/${id}`);

            const adminData = JSON.parse(localStorage.getItem('adminInfo') || sessionStorage.getItem('adminInfo') || '{}');
            const userId = adminData._id || adminData.id || sessionStorage.getItem("user_id") || 'admin';
            const userName = adminData.name || adminData.username || "Admin";

            if (userId) {
                dispatch(
                    createActivityLogThunk({
                        user_id: userId,
                        user: userName,
                        action: "Deleted",
                        module: "Business Type",
                        details: `Business Type '${itemToDelete?.business_type || id}' deleted`,
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
    businessTypes: [],
    loading: false,
    error: null,
};

const businessTypeSlice = createSlice({
    name: "businessTypes",
    initialState,
    reducers: {
        clearBusinessTypeError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchBusinessTypes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBusinessTypes.fulfilled, (state, action) => {
                state.loading = false;
                state.businessTypes = action.payload;
            })
            .addCase(fetchBusinessTypes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create
            .addCase(addBusinessType.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addBusinessType.fulfilled, (state, action) => {
                state.loading = false;
                state.businessTypes.push(action.payload);
            })
            .addCase(addBusinessType.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update
            .addCase(updateBusinessType.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateBusinessType.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.businessTypes.findIndex(
                    (item) => item._id === action.payload._id || item.id === action.payload.id
                );
                if (index !== -1) state.businessTypes[index] = action.payload;
            })
            .addCase(updateBusinessType.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete
            .addCase(deleteBusinessType.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteBusinessType.fulfilled, (state, action) => {
                state.loading = false;
                state.businessTypes = state.businessTypes.filter(
                    (item) => item._id !== action.payload && item.id !== action.payload
                );
            })
            .addCase(deleteBusinessType.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearBusinessTypeError } = businessTypeSlice.actions;
export default businessTypeSlice.reducer;