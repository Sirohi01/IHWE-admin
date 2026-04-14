import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../../../lib/api";
import { createActivityLogThunk } from "../../activityLog/activityLogSlice";

const BASE_URL = API_URL;

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

const getSecondaryProductName = (item) =>
    item?.secondary_product ||
    item?.secondary_product_categories ||
    item?.secondary_product_category ||
    "";

const SECONDARY_PRODUCT_MODULE = "Secondary Product Categories";

export const fetchSecondaryProduct = createAsyncThunk(
    "secondaryProduct/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/secondary-products`);
            return response.data.data || response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const addSecondaryProduct = createAsyncThunk(
    "secondaryProduct/create",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/secondary-products`, data, {
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
                        module: SECONDARY_PRODUCT_MODULE,
                        details: `Secondary Product '${getSecondaryProductName(created) || getSecondaryProductName(data)}' created`,
                    })
                );
            }

            return created;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const updateSecondaryProduct = createAsyncThunk(
    "secondaryProduct/update",
    async ({ id, updatedData }, { dispatch, rejectWithValue }) => {
        try {
            const { userId, userName } = getUserInfo();

            const dataWithUser = {
                ...updatedData,
                updated_by: userId || null,
            };

            const response = await axios.put(
                `${BASE_URL}/secondary-products/${id}`,
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
                        module: SECONDARY_PRODUCT_MODULE,
                        details: `Secondary Product '${getSecondaryProductName(updated) || getSecondaryProductName(updatedData) || id}' updated`,
                    })
                );
            }

            return updated;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const deleteSecondaryProduct = createAsyncThunk(
    "secondaryProduct/delete",
    async (id, { dispatch, getState, rejectWithValue }) => {
        try {
            const { secondaryProduct } = getState().secondaryProduct;
            const itemToDelete = secondaryProduct.find(
                (item) => item._id === id || item.id === id
            );

            await axios.delete(`${BASE_URL}/secondary-products/${id}`);

            const { userId, userName } = getUserInfo();

            if (userId) {
                dispatch(
                    createActivityLogThunk({
                        user_id: userId,
                        user: userName,
                        action: "Deleted",
                        module: SECONDARY_PRODUCT_MODULE,
                        details: `Secondary Product '${getSecondaryProductName(itemToDelete) || id}' deleted`,
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
    secondaryProduct: [],
    loading: false,
    error: null,
};

const secondaryProductSlice = createSlice({
    name: "secondaryProduct",
    initialState,
    reducers: {
        clearSecondaryProductError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSecondaryProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSecondaryProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.secondaryProduct = action.payload;
            })
            .addCase(fetchSecondaryProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(addSecondaryProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addSecondaryProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.secondaryProduct.push(action.payload);
            })
            .addCase(addSecondaryProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(updateSecondaryProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateSecondaryProduct.fulfilled, (state, action) => {
                state.loading = false;

                const index = state.secondaryProduct.findIndex(
                    (item) => item._id === action.payload._id || item.id === action.payload.id
                );

                if (index !== -1) {
                    state.secondaryProduct[index] = action.payload;
                }
            })
            .addCase(updateSecondaryProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(deleteSecondaryProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteSecondaryProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.secondaryProduct = state.secondaryProduct.filter(
                    (item) => item._id !== action.payload && item.id !== action.payload
                );
            })
            .addCase(deleteSecondaryProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearSecondaryProductError } = secondaryProductSlice.actions;
export default secondaryProductSlice.reducer;
