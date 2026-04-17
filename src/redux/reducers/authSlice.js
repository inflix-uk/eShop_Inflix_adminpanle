// authSlice.js
import { createSlice } from '@reduxjs/toolkit';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const initialState = {
    user: null,
    ip: BACKEND_URL, // Initialize ip state
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action) => {
            state.user = action.payload;
        },
        logout: (state) => {
            state.user = null;
        },
        setIp: (state, action) => {
            state.ip = action.payload;
        },
    },
});

export const { login, logout, setIp } = authSlice.actions;

export default authSlice.reducer;
