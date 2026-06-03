import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../../../lib/api";
import { createActivityLogThunk } from "../../activityLog/activityLogSlice";

const BASE_URL = API_URL;
const MODULE_NAME = "Document Configuration";

const getUserInfo = () => {
    const adminData = JSON.parse(
        localStorage.getItem("adminInfo") ||
        sessionStorage.getItem("adminInfo") ||
        "{}"
    );
    const userStr = sessionStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : {};
    const userId =
        adminData._id ||
        adminData.id ||
        sessionStorage.getItem("user_id") ||
        user._id ||
        "admin";
    const userName = adminData.name || adminData.username || user.name || "Admin";

    return { userId, userName };
};

export const fetchDocumentRequirements = createAsyncThunk(
    "documentRequirements/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${BASE_URL}/document-requirements`);
            return res.data.data || res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const addDocumentRequirement = createAsyncThunk(
    "documentRequirements/create",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/document-requirements`, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const created = response.data.data || response.data;
            const { userId, userName } = getUserInfo();

            if (userId) {
                dispatch(
                    createActivityLogThunk({
                        user_id: userId,
                        user: userName,
                        action: "Created",
                        module: MODULE_NAME,
                        details: `Document Requirement '${created.document_name}' created`,
                    })
                );
            }

            return created;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const updateDocumentRequirement = createAsyncThunk(
    "documentRequirements/update",
    async ({ id, updatedData }, { dispatch, rejectWithValue }) => {
        try {
            const { userId, userName } = getUserInfo();

            const dataWithUser = {
                ...updatedData,
                updated_by: userId || null,
            };

            const response = await axios.put(
                `${BASE_URL}/document-requirements/${id}`,
                dataWithUser,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const updated = response.data.data || response.data;

            if (userId) {
                dispatch(
                    createActivityLogThunk({
                        user_id: userId,
                        user: userName,
                        action: "Updated",
                        module: MODULE_NAME,
                        details: `Document Requirement '${updated.document_name}' updated`,
                    })
                );
            }

            return updated;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const deleteDocumentRequirement = createAsyncThunk(
    "documentRequirements/delete",
    async (id, { dispatch, getState, rejectWithValue }) => {
        try {
            const { documentRequirements = [] } = getState().documentRequirements || {};
            const itemToDelete = documentRequirements.find(
                (item) => item._id === id || item.id === id
            );

            await axios.delete(`${BASE_URL}/document-requirements/${id}`);

            const { userId, userName } = getUserInfo();

            if (userId) {
                dispatch(
                    createActivityLogThunk({
                        user_id: userId,
                        user: userName,
                        action: "Deleted",
                        module: MODULE_NAME,
                        details: `Document Requirement '${itemToDelete?.document_name || id}' deleted`,
                    })
                );
            }

            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

const initialState = {
    documentRequirements: [],
    loading: false,
    error: null,
};

const documentRequirementSlice = createSlice({
    name: "documentRequirements",
    initialState,
    reducers: {
        clearDocumentRequirementError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDocumentRequirements.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDocumentRequirements.fulfilled, (state, action) => {
                state.loading = false;
                state.documentRequirements = action.payload;
            })
            .addCase(fetchDocumentRequirements.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(addDocumentRequirement.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addDocumentRequirement.fulfilled, (state, action) => {
                state.loading = false;
                state.documentRequirements.push(action.payload);
            })
            .addCase(addDocumentRequirement.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(updateDocumentRequirement.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateDocumentRequirement.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.documentRequirements.findIndex(
                    (item) => item._id === action.payload._id || item.id === action.payload.id
                );

                if (index !== -1) {
                    state.documentRequirements[index] = action.payload;
                }
            })
            .addCase(updateDocumentRequirement.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(deleteDocumentRequirement.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteDocumentRequirement.fulfilled, (state, action) => {
                state.loading = false;
                state.documentRequirements = state.documentRequirements.filter(
                    (item) => item._id !== action.payload && item.id !== action.payload
                );
            })
            .addCase(deleteDocumentRequirement.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearDocumentRequirementError } = documentRequirementSlice.actions;
export default documentRequirementSlice.reducer;
