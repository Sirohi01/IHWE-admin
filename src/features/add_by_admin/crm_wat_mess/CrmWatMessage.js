import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { createActivityLogThunk } from "../../activityLog/activityLogSlice";
import { API_URL } from "../../../lib/api";

const BASE_URL = API_URL;

// ✅ Fetch All Messages
export const fetchMessages = createAsyncThunk(
  "crmMessages/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/crm-messages`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// ✅ Fetch Single Message by ID
export const fetchMessageById = createAsyncThunk(
  "crmMessages/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/crm-messages/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// ✅ Create New Message (FormData — file upload support)
export const createMessage = createAsyncThunk(
  "crmMessages/create",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/crm-messages`, formData);

      const userStr = sessionStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = sessionStorage.getItem("user_id") || user._id;
      const userName = user.name || "User";

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `WhatsApp Message '${response.data.msg_name || ""}' created by ${userName}`,
            link: `/crm-messages/${response.data._id}`,
            section: "crmMessages",
            data: {
              action: "CREATE",
              message_id: response.data._id,
              msg_name: response.data.msg_name,
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

// ✅ Update Existing Message (FormData — file upload support)
export const updateMessage = createAsyncThunk(
  "crmMessages/update",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/crm-messages/${id}`,
        formData,
      );

      const userStr = sessionStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = sessionStorage.getItem("user_id") || user._id;
      const userName = user.name || "User";

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `WhatsApp Message '${response.data.msg_name || id}' updated by ${userName}`,
            link: `/crm-messages/${id}`,
            section: "crmMessages",
            data: {
              action: "UPDATE",
              message_id: id,
              msg_name: response.data.msg_name,
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

// ✅ Delete Message
export const deleteMessage = createAsyncThunk(
  "crmMessages/delete",
  async (id, { dispatch, getState, rejectWithValue }) => {
    try {
      const { messages } = getState().crmMessages;
      const messageToDelete = messages.find((m) => m._id === id);

      await axios.delete(`${BASE_URL}/crm-messages/${id}`);

      const userStr = sessionStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = sessionStorage.getItem("user_id") || user._id;
      const userName = user.name || "User";

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `WhatsApp Message '${messageToDelete?.msg_name || id}' deleted by ${userName}`,
            link: `/crm-messages`,
            section: "crmMessages",
            data: {
              action: "DELETE",
              message_id: id,
              msg_name: messageToDelete?.msg_name,
              deleted_data: messageToDelete || {},
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

const initialState = {
  messages: [],
  loading: false,
  error: null,
};

const crmMessageSlice = createSlice({
  name: "crmMessages",
  initialState,
  reducers: {
    clearMessageError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Single
      .addCase(fetchMessageById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessageById.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.messages.findIndex(
          (m) => m._id === action.payload._id,
        );
        if (index !== -1) {
          state.messages[index] = action.payload;
        } else {
          state.messages.push(action.payload);
        }
      })
      .addCase(fetchMessageById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push(action.payload);
      })
      .addCase(createMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMessage.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.messages.findIndex(
          (m) => m._id === action.payload._id,
        );
        if (index !== -1) state.messages[index] = action.payload;
      })
      .addCase(updateMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = state.messages.filter((m) => m._id !== action.payload);
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessageError } = crmMessageSlice.actions;
export default crmMessageSlice.reducer;
