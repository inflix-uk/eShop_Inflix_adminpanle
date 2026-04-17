import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

const initialState = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    Cpassword: '',
    progress: 0,
    status: 'idle',
    error: null,
};

export const registerUser = createAsyncThunk(
    'register/registerUser',
    async (userData, { dispatch, getState, rejectWithValue }) => {
        const state = getState();
        const ip = state.auth.ip; // Access IP from the auth slice in the Redux store

        try {
            dispatch(setProgress(30));
            const response = await axios.post(`${ip}register`, {
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                phoneNumber: userData.phoneNumber,
                password: userData.password,
            });
            console.log('response', response.data);
            dispatch(setProgress(100));
            if (response.data.status === 201) {
                toast.success(response.data.message); // Show success toast notification
                return response.data;
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            dispatch(setProgress(100));

            // Log the error message and error details for debugging
            console.error('Error during registration:', error.message);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
                console.error('Error response headers:', error.response.headers);
            } else if (error.request) {
                console.error('Error request:', error.request);
            } else {
                console.error('General error message:', error.message);
            }

            toast.error(`Registration failed: ${error.message}`);
            return rejectWithValue(error.message);
        }
    }
);

const registerSlice = createSlice({
    name: 'register',
    initialState,
    reducers: {
        setFirstName: (state, action) => {
            state.firstName = action.payload;
        },
        setLastName: (state, action) => {
            state.lastName = action.payload;
        },
        setEmail: (state, action) => {
            state.email = action.payload;
        },
        setPhoneNumber: (state, action) => {
            state.phoneNumber = action.payload;
        },
        setPassword: (state, action) => {
            state.password = action.payload;
        },
        setCPassword: (state, action) => {
            state.Cpassword = action.payload;
        },
        setProgress: (state, action) => {
            state.progress = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.error = null;
                // Reset form fields on success
                state.firstName = '';
                state.lastName = '';
                state.email = '';
                state.phoneNumber = '';
                state.password = '';
                state.Cpassword = '';
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const {
    setFirstName,
    setLastName,
    setEmail,
    setPhoneNumber,
    setPassword,
    setCPassword,
    setProgress,
} = registerSlice.actions;

export default registerSlice.reducer;
