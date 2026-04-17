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
export const fetchUnit = createAsyncThunk(
    "unit/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${BASE_URL}/units`);
            return res.data.data || res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to fetch units"
            );
        }
    }
);

// ✅ Add
export const addUnit = createAsyncThunk(
    "unit/add",
    async (payload, { rejectWithValue, dispatch }) => {
        try {
            const res = await axios.post(`${BASE_URL}/units`, payload);
            const created = res.data.data || res.data;

            const { userId, userName } = getUserInfo();
            if (userId) {
                dispatch(
                    createActivityLogThunk({
                        user_id: userId,
                        user: userName,
                        action: "Created",
                        module: "Unit",
                        details: `Added new unit: ${payload.unit_name}`,
                    })
                );
            }

            return created;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to add unit"
            );
        }
    }
);

// ✅ Update
export const updateUnit = createAsyncThunk(
    "unit/update",
    async ({ id, updatedData }, { rejectWithValue, dispatch }) => {
        try {
            const res = await axios.put(`${BASE_URL}/units/${id}`, updatedData);

            const { userId, userName } = getUserInfo();
            if (userId) {
                dispatch(
                    createActivityLogThunk({
                        user_id: userId,
                        user: userName,
                        action: "Updated",
                        module: "Unit",
                        details: `Updated unit: ${updatedData.unit_name}`,
                    })
                );
            }

            return res.data.data || res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to update unit"
            );
        }
    }
);

// ✅ Delete
export const deleteUnit = createAsyncThunk(
    "unit/delete",
    async (id, { rejectWithValue, dispatch, getState }) => {
        try {
            const { units } = getState().unit;
            const itemToDelete = units.find((item) => item._id === id);

            await axios.delete(`${BASE_URL}/units/${id}`);

            const { userId, userName } = getUserInfo();
            if (userId) {
                dispatch(
                    createActivityLogThunk({
                        user_id: userId,
                        user: userName,
                        action: "Deleted",
                        module: "Unit",
                        details: `Deleted unit: ${itemToDelete?.unit_name || id}`,
                    })
                );
            }

            return id;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to delete unit"
            );
        }
    }
);

// ✅ Update Status
export const updateUnitStatus = createAsyncThunk(
    "unit/updateStatus",
    async ({ id, status }, { rejectWithValue, dispatch, getState }) => {
        try {
            const { units } = getState().unit;
            const itemToUpdate = units.find((item) => item._id === id);

            const res = await axios.put(`${BASE_URL}/units/${id}/status`, { status });

            const { userId, userName } = getUserInfo();
            if (userId) {
                dispatch(
                    createActivityLogThunk({
                        user_id: userId,
                        user: userName,
                        action: "Updated",
                        module: "Unit",
                        details: `Updated status to '${status}' for unit: ${itemToUpdate?.unit_name || id}`,
                    })
                );
            }

            return res.data.data || res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to update unit status"
            );
        }
    }
);

// 🔥 Initial State
const initialState = {
    units: [],
    loading: false,
    error: null,
    success: false,
    message: "",
};

// 🚀 Slice
const unitSlice = createSlice({
    name: "unit",
    initialState,
    reducers: {
        clearUnitError: (state) => { state.error = null; },
        resetUnitState: (state) => { state.success = false; state.message = ""; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUnit.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchUnit.fulfilled, (state, action) => { state.loading = false; state.units = action.payload; })
            .addCase(fetchUnit.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(addUnit.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(addUnit.fulfilled, (state, action) => { state.loading = false; state.success = true; state.units.push(action.payload); state.message = "Added successfully"; })
            .addCase(addUnit.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(updateUnit.fulfilled, (state, action) => { state.loading = false; state.success = true; const index = state.units.findIndex((item) => item._id === action.payload._id); if (index !== -1) { state.units[index] = action.payload; } state.message = "Updated successfully"; })

            .addCase(deleteUnit.fulfilled, (state, action) => { state.loading = false; state.success = true; state.units = state.units.filter((item) => item._id !== action.payload); state.message = "Deleted successfully"; })

            .addCase(updateUnitStatus.fulfilled, (state, action) => { state.loading = false; state.success = true; const index = state.units.findIndex((item) => item._id === action.payload._id); if (index !== -1) { state.units[index] = action.payload; } state.message = "Status updated"; });
    },
});

export const { clearUnitError, resetUnitState } = unitSlice.actions;
export default unitSlice.reducer;