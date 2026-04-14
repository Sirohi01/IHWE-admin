import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../../../lib/api";
import { createActivityLogThunk } from "../../activityLog/activityLogSlice";

const BASE_URL = API_URL;
const MEETING_PRIORITY_MODULE = "Meeting Priority Level";

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

const getMeetingPriorityName = (item) =>
    item?.meeting_priority_level ||
    item?.meeting_priority ||
    item?.priority ||
    "";

export const fetchMeetingPriorities = createAsyncThunk(
    "meetingPriority/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${BASE_URL}/meeting-priorities`);
            return res.data.data || res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const addMeetingPriority = createAsyncThunk(
    "meetingPriority/create",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/meeting-priorities`, data, {
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
                        module: MEETING_PRIORITY_MODULE,
                        details: `Meeting Priority '${getMeetingPriorityName(created) || getMeetingPriorityName(data)}' created`,
                    })
                );
            }

            return created;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const updateMeetingPriority = createAsyncThunk(
    "meetingPriority/update",
    async ({ id, updatedData }, { dispatch, rejectWithValue }) => {
        try {
            const { userId, userName } = getUserInfo();

            const dataWithUser = {
                ...updatedData,
                updated_by: userId || null,
            };

            const response = await axios.put(
                `${BASE_URL}/meeting-priorities/${id}`,
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
                        module: MEETING_PRIORITY_MODULE,
                        details: `Meeting Priority '${getMeetingPriorityName(updated) || getMeetingPriorityName(updatedData) || id}' updated`,
                    })
                );
            }

            return updated;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const deleteMeetingPriority = createAsyncThunk(
    "meetingPriority/delete",
    async (id, { dispatch, getState, rejectWithValue }) => {
        try {
            const { meetingPriority = [] } = getState().meetingPriority || {};
            const itemToDelete = meetingPriority.find(
                (item) => item._id === id || item.id === id
            );

            await axios.delete(`${BASE_URL}/meeting-priorities/${id}`);

            const { userId, userName } = getUserInfo();

            if (userId) {
                dispatch(
                    createActivityLogThunk({
                        user_id: userId,
                        user: userName,
                        action: "Deleted",
                        module: MEETING_PRIORITY_MODULE,
                        details: `Meeting Priority '${getMeetingPriorityName(itemToDelete) || id}' deleted`,
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
    meetingPriority: [],
    loading: false,
    error: null,
};

const meetingPrioritySlice = createSlice({
    name: "meetingPriority",
    initialState,
    reducers: {
        clearMeetingPriorityError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMeetingPriorities.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMeetingPriorities.fulfilled, (state, action) => {
                state.loading = false;
                state.meetingPriority = action.payload;
            })
            .addCase(fetchMeetingPriorities.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(addMeetingPriority.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addMeetingPriority.fulfilled, (state, action) => {
                state.loading = false;
                state.meetingPriority.push(action.payload);
            })
            .addCase(addMeetingPriority.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(updateMeetingPriority.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateMeetingPriority.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.meetingPriority.findIndex(
                    (item) => item._id === action.payload._id || item.id === action.payload.id
                );

                if (index !== -1) {
                    state.meetingPriority[index] = action.payload;
                }
            })
            .addCase(updateMeetingPriority.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(deleteMeetingPriority.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteMeetingPriority.fulfilled, (state, action) => {
                state.loading = false;
                state.meetingPriority = state.meetingPriority.filter(
                    (item) => item._id !== action.payload && item.id !== action.payload
                );
            })
            .addCase(deleteMeetingPriority.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearMeetingPriorityError } = meetingPrioritySlice.actions;
export default meetingPrioritySlice.reducer;
