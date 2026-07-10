import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { doctorService } from '../../services/doctorService';
import type { Doctor } from '../../types';

interface DoctorState {
    doctors: Doctor[];
    loading: boolean;
    error: string | null;
}

const initialState: DoctorState = {
    doctors: [],
    loading: false,
    error: null,
};

export const fetchDoctors = createAsyncThunk('doctors/fetchDoctors', async (_, { rejectWithValue }) => {
    try {
        return await doctorService.getAllDoctors();
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch doctors');
    }
});

export const createDoctor = createAsyncThunk('doctors/createDoctor', async (doctorData: Omit<Doctor, '_id'>, { rejectWithValue }) => {
    try {
        return await doctorService.createDoctor(doctorData);
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to create doctor');
    }
});

const doctorSlice = createSlice({
    name: 'doctors',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDoctors.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDoctors.fulfilled, (state, action) => {
                state.loading = false;
                state.doctors = action.payload;
            })
            .addCase(fetchDoctors.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createDoctor.fulfilled, (state, action) => {
                state.doctors.push(action.payload);
            });
    },
});

export default doctorSlice.reducer;
