import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../../lib/api";

const BASE_URL = API_URL;

// Fetch all documents for a client
export const fetchClientDocuments = createAsyncThunk(
    "clientDocuments/fetchAll",
    async (clientId, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${BASE_URL}/client-documents/${clientId}`);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Upload a new document
export const uploadClientDocument = createAsyncThunk(
    "clientDocuments/upload",
    async (formData, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE_URL}/client-documents/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Update document status
export const updateDocumentStatus = createAsyncThunk(
    "clientDocuments/updateStatus",
    async ({ id, status, author }, { rejectWithValue }) => {
        try {
            const res = await axios.patch(`${BASE_URL}/client-documents/${id}/status`, { status, author });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Add document comment
export const addDocumentComment = createAsyncThunk(
    "clientDocuments/addComment",
    async ({ id, text, author }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE_URL}/client-documents/${id}/comment`, { text, author });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Delete document
export const deleteClientDocument = createAsyncThunk(
    "clientDocuments/delete",
    async (id, { rejectWithValue }) => {
        try {
            const res = await axios.delete(`${BASE_URL}/client-documents/${id}`);
            return res.data; // { message, id }
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

const clientDocumentSlice = createSlice({
    name: "clientDocuments",
    initialState: {
        documents: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchClientDocuments.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchClientDocuments.fulfilled, (state, action) => {
                state.loading = false;
                state.documents = action.payload;
            })
            .addCase(fetchClientDocuments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Upload
            .addCase(uploadClientDocument.fulfilled, (state, action) => {
                const index = state.documents.findIndex(d => d._id === action.payload._id);
                if (index !== -1) {
                    state.documents[index] = action.payload;
                } else {
                    state.documents.push(action.payload);
                }
            })
            // Update Status
            .addCase(updateDocumentStatus.fulfilled, (state, action) => {
                const index = state.documents.findIndex(d => d._id === action.payload._id);
                if (index !== -1) {
                    state.documents[index] = action.payload;
                }
            })
            // Add Comment
            .addCase(addDocumentComment.fulfilled, (state, action) => {
                const index = state.documents.findIndex(d => d._id === action.payload._id);
                if (index !== -1) {
                    state.documents[index] = action.payload;
                }
            })
            // Delete
            .addCase(deleteClientDocument.fulfilled, (state, action) => {
                state.documents = state.documents.filter(d => d._id !== action.payload.id);
            });
    }
});

export default clientDocumentSlice.reducer;
