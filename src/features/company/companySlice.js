import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { createActivityLogThunk } from "../activityLog/activityLogSlice";
// import api, { API_URL, SERVER_URL } from "../../lib/api";
const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${BASE_URL}/companies`;
// const API_URL = "/api/companies";

// ✅ Helper — user info sessionStorage se lo
const getUserInfo = () => {
  const userStr = sessionStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  return {
    userId: sessionStorage.getItem("user_id") || user._id,
    userName: user.name || sessionStorage.getItem("user_name") || "User",
    token: sessionStorage.getItem("token"),
  };
};

// ✅ Fetch All Companies
export const fetchCompanies = createAsyncThunk(
  "company/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { token } = getUserInfo();
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// ✅ Add New Company
export const addCompany = createAsyncThunk(
  "company/add",
  async (companyData, { dispatch, rejectWithValue }) => {
    const { token, userId, userName } = getUserInfo();
    if (!token) return rejectWithValue("No token provided");

    try {
      const res = await axios.post(API_URL, companyData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const created = res.data.data || res.data;

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Company '${created.companyName || ""}' created by ${userName}`,
            link: `/companies/${created._id}`,
            section: "companies",
            data: {
              action: "CREATE",
              company_id: created._id,
              company_name: created.companyName,
              created_data: created,
            },
          }),
        );
      }

      return created;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// ✅ Update Company
export const updateCompany = createAsyncThunk(
  "company/update",
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    const { token, userId, userName } = getUserInfo();

    try {
      // ✅ updated_by add karo
      const dataWithUser = {
        ...data,
        updated_by: userName || null,
      };

      const res = await axios.put(`${API_URL}/${id}`, dataWithUser, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const updated = res.data.data || res.data;

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Company '${updated.companyName || data.companyName || id}' updated by ${userName}`,
            link: `/companies/${id}`,
            section: "companies",
            data: {
              action: "UPDATE",
              company_id: id,
              company_name: updated.companyName || data.companyName,
              updated_fields: data,
              updated_data: updated,
            },
          }),
        );
      }

      return updated;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// ✅ Delete Company
export const deleteCompany = createAsyncThunk(
  "company/delete",
  async (id, { dispatch, getState, rejectWithValue }) => {
    const { token, userId, userName } = getUserInfo();

    try {
      const { companies } = getState().companies;
      const companyToDelete = companies.find((c) => c._id === id);

      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `Company '${companyToDelete?.companyName || id}' deleted by ${userName}`,
            link: `/companies`,
            section: "companies",
            data: {
              action: "DELETE",
              company_id: id,
              company_name: companyToDelete?.companyName,
              deleted_data: companyToDelete || {},
            },
          }),
        );
      }

      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

const initialState = {
  companies: [],
  loading: false,
  error: null,
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    clearCompanyError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add Company
      .addCase(addCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.companies.push(action.payload);
      })
      .addCase(addCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Company
      .addCase(updateCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.companies.findIndex(
          (c) => c._id === action.payload._id,
        );
        if (index !== -1) state.companies[index] = action.payload;
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Company
      .addCase(deleteCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = state.companies.filter(
          (c) => c._id !== action.payload,
        );
      })
      .addCase(deleteCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCompanyError } = companySlice.actions;
export default companySlice.reducer;
