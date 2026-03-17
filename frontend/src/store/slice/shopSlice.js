// src/Slice/shopSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api.util';

// DELETE SERVICE
export const deleteService = createAsyncThunk('shop/deleteService', async (id, { rejectWithValue }) => {
    try {
        const response = await api.delete(`/services/${id}`);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Delete failed');
    }
}
);


export const getService = createAsyncThunk('shop/getService', async (id, { rejectWithValue }) => {
    try {
        const response = await api.get(`/services`);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'getService failed');
    }
}
);



const shopSlice = createSlice({
    name: 'shop',
    initialState: {
        user: null,
        token: null,
        loading: false,
        error: null,
        userData: null,
        services: [],
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.userData = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(deleteService.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteService.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(deleteService.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(getService.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getService.fulfilled, (state, action) => {
                state.loading = false;
                state.services = action.payload;
            })
            .addCase(getService.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

    },
});

export const { logout } = shopSlice.actions;
export default shopSlice.reducer;
