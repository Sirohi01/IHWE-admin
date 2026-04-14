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
    const userId = adminData._id || adminData.id || sessionStorage.getItem("user_id") || user._id;
    const userName = adminData.name || adminData.username || user.name || "Admin";
    return { userId, userName };
};

// ✅ Fetch All
export const fetchAnnualTurnover = createAsyncThunk(
    "annualTurnover/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${BASE_URL}/annual-turnovers`);
            return res.data.data || res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to fetch annual turnover"
            );
        }
    }
);

// ✅ Add
export const addAnnualTurnover = createAsyncThunk(
    "annualTurnover/add",
    async (payload, { rejectWithValue, dispatch }) => {
        try {
            const res = await axios.post(`${BASE_URL}/annual-turnovers`, payload);
            const created = res.data.data || res.data;

            const { userId, userName } = getUserInfo();
            if (userId) {
                dispatch(
                    createActivityLogThunk({
                        user_id: userId,
                        user: userName,
                        action: "Created",
                        module: "Annual Turnover",
                        details: `Added annual turnover: ${payload.annual_turnover}`,
                    })
                );
            }

            return created;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to add annual turnover"
            );
        }
    }
);

// ✅ Update
export const updateAnnualTurnover = createAsyncThunk(
    "annualTurnover/update",
    async ({ id, updatedData }, { rejectWithValue, dispatch }) => {
        try {
            const res = await axios.put(
                `${BASE_URL}/annual-turnovers/${id}`,
                updatedData
            );

            const { userId, userName } = getUserInfo();
            if (userId) {
                dispatch(
                    createActivityLogThunk({
                        user_id: userId,
                        user: userName,
                        action: "Updated",
                        module: "Annual Turnover",
                        details: `Updated annual turnover: ${updatedData.annual_turnover}`,
                    })
                );
            }

            return res.data.data || res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to update annual turnover"
            );
        }
    }
);

// ✅ Delete
export const deleteAnnualTurnover = createAsyncThunk(
    "annualTurnover/delete",
    async (id, { rejectWithValue, dispatch, getState }) => {
        try {
            const { annualTurnover } = getState().annualTurnover;
            const itemToDelete = annualTurnover.find((item) => item._id === id);

            const res = await axios.delete(
                `${BASE_URL}/annual-turnovers/${id}`
            );

            const { userId, userName } = getUserInfo();
            if (userId) {
                dispatch(
                    createActivityLogThunk({
                        user_id: userId,
                        user: userName,
                        action: "Deleted",
                        module: "Annual Turnover",
                        details: `Deleted annual turnover: ${itemToDelete?.annual_turnover || id}`,
                    })
                );
            }

            return id;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to delete annual turnover"
            );
        }
    }
);

// ✅ Update Status
export const updateStatus = createAsyncThunk(
    "annualTurnover/updateStatus",
    async ({ id, status }, { rejectWithValue, dispatch, getState }) => {
        try {
            const { annualTurnover } = getState().annualTurnover;
            const itemToUpdate = annualTurnover.find((item) => item._id === id);

            const res = await axios.put(
                `${BASE_URL}/annual-turnovers/${id}/status`,
                { status }
            );

            const { userId, userName } = getUserInfo();
            if (userId) {
                dispatch(
                    createActivityLogThunk({
                        user_id: userId,
                        user: userName,
                        action: "Updated",
                        module: "Annual Turnover",
                        details: `Updated status to '${status}' for annual turnover: ${itemToUpdate?.annual_turnover || id}`,
                    })
                );
            }

            return res.data.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to update status"
            );
        }
    }
);

// 🔥 Initial State
const initialState = {
    annualTurnover: [],
    loading: false,
    error: null,
    success: false,
    message: "",
};

// 🚀 Slice
const annualTurnoverSlice = createSlice({
    name: "annualTurnover",
    initialState,
    reducers: {
        clearAnnualTurnoverError: (state) => {
            state.error = null;
        },
        resetAnnualTurnoverState: (state) => {
            state.success = false;
            state.message = "";
        },
    },
    extraReducers: (builder) => {
        builder

            // FETCH
            .addCase(fetchAnnualTurnover.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAnnualTurnover.fulfilled, (state, action) => {
                state.loading = false;
                state.annualTurnover = action.payload;
            })
            .addCase(fetchAnnualTurnover.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ADD
            .addCase(addAnnualTurnover.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addAnnualTurnover.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.annualTurnover.push(action.payload);
                state.message = "Added successfully";
            })
            .addCase(addAnnualTurnover.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // UPDATE
            .addCase(updateAnnualTurnover.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;

                const index = state.annualTurnover.findIndex(
                    (item) => item._id === action.payload._id
                );

                if (index !== -1) {
                    state.annualTurnover[index] = action.payload;
                }

                state.message = "Updated successfully";
            })

            // DELETE
            .addCase(deleteAnnualTurnover.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;

                state.annualTurnover = state.annualTurnover.filter(
                    (item) => item._id !== action.payload
                );

                state.message = "Deleted successfully";
            })

            // STATUS
            .addCase(updateStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;

                const index = state.annualTurnover.findIndex(
                    (item) => item._id === action.payload._id
                );

                if (index !== -1) {
                    state.annualTurnover[index] = action.payload;
                }

                state.message = "Status updated";
            });
    },
});

// 🔥 Exports
export const {
    clearAnnualTurnoverError,
    resetAnnualTurnoverState,
} = annualTurnoverSlice.actions;

export default annualTurnoverSlice.reducer;