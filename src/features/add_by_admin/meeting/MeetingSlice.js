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
export  const addMeeting = createActivityLogThunk(
    "meeting/add",
    
)


