import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AppointmentState {
    lastIncomingEvent: {
        eventType: 'CREATED' | 'UPDATED' | 'CANCELLED';
        payload: any; // The full appointment object
        timestamp: number;
    } | null;
}

const initialState: AppointmentState = {
    lastIncomingEvent: null,
};

const appointmentSlice = createSlice({
    name: 'appointments',
    initialState,
    reducers: {
        socketAppointmentCreated: (state, action: PayloadAction<any>) => {
            state.lastIncomingEvent = {
                eventType: 'CREATED',
                payload: action.payload,
                timestamp: Date.now()
            };
        },
        socketAppointmentUpdated: (state, action: PayloadAction<any>) => {
            state.lastIncomingEvent = {
                eventType: 'UPDATED',
                payload: action.payload,
                timestamp: Date.now()
            };
        },
        socketAppointmentCancelled: (state, action: PayloadAction<any>) => {
            state.lastIncomingEvent = {
                eventType: 'CANCELLED',
                payload: action.payload,
                timestamp: Date.now()
            };
        }
    }
});

export const { socketAppointmentCreated, socketAppointmentUpdated, socketAppointmentCancelled } = appointmentSlice.actions;

export default appointmentSlice.reducer;
