import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../lib/api";
import { createActivityLogThunk } from "../../activityLog/activityLogSlice";

const getUserInfo = () => {
  const userStr = sessionStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  return {
    userId: sessionStorage.getItem("user_id") || user._id,
    userName: user.name || "User",
  };
};

export const fetchNextActions = createAsyncThunk("nextActions/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/api/next-action");
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const createNextAction = createAsyncThunk("nextActions/create", async (data, { dispatch, rejectWithValue }) => {
  try {
    const res = await api.post("/api/next-action", data);
    const { userId, userName } = getUserInfo();
    if (userId) dispatch(createActivityLogThunk({ user_id: userId, message: `Next Action '${data.name}' created by ${userName}`, section: "System Configuration", data: { action: "CREATE", name: data.name } }));
    return res.data?.data || res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const updateNextAction = createAsyncThunk("nextActions/update", async ({ id, data }, { dispatch, rejectWithValue }) => {
  try {
    const res = await api.put(`/api/next-action/${id}`, data);
    const { userId, userName } = getUserInfo();
    if (userId) dispatch(createActivityLogThunk({ user_id: userId, message: `Next Action '${data.name}' updated by ${userName}`, section: "System Configuration", data: { action: "UPDATE", id, name: data.name } }));
    return res.data?.data || res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const deleteNextAction = createAsyncThunk("nextActions/delete", async (id, { dispatch, getState, rejectWithValue }) => {
  try {
    const { nextActions } = getState().nextActions;
    const item = nextActions.find((n) => n._id === id);
    await api.delete(`/api/next-action/${id}`);
    const { userId, userName } = getUserInfo();
    if (userId) dispatch(createActivityLogThunk({ user_id: userId, message: `Next Action '${item?.name || id}' deleted by ${userName}`, section: "System Configuration", data: { action: "DELETE", id } }));
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

const nextActionSlice = createSlice({
  name: "nextActions",
  initialState: { nextActions: [], loading: false, error: null },
  reducers: { clearNextActionError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNextActions.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchNextActions.fulfilled, (state, action) => { state.loading = false; state.nextActions = Array.isArray(action.payload) ? action.payload : action.payload?.data || []; })
      .addCase(fetchNextActions.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createNextAction.fulfilled, (state, action) => { if (action.payload?._id) state.nextActions.push(action.payload); })
      .addCase(updateNextAction.fulfilled, (state, action) => { const idx = state.nextActions.findIndex((n) => n._id === action.payload?._id); if (idx !== -1) state.nextActions[idx] = action.payload; })
      .addCase(deleteNextAction.fulfilled, (state, action) => { state.nextActions = state.nextActions.filter((n) => n._id !== action.payload); });
  },
});

export const { clearNextActionError } = nextActionSlice.actions;
export default nextActionSlice.reducer;
