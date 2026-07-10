import api from '../lib/api';

export interface BookingPayload {
    doctorId: string;
    date: string;
    startTime: string;
    endTime: string;
    purpose: string;
    patientInfo: {
        mobileNumber: string;
        name: string;
        patientId: string;
    }
}

export const appointmentService = {
    bookAppointment: async (payload: BookingPayload) => {
        const response = await api.post('/api/v1/appointments', payload);
        return response.data.data;
    },

    getAppointments: async (params: URLSearchParams) => {
        const response = await api.get(`/api/v1/appointments?${params.toString()}`);
        return response.data; // Needs data and meta
    },

    markArrived: async (id: string) => {
        const response = await api.post(`/api/v1/appointments/${id}/arrive`);
        return response.data;
    },

    cancelAppointment: async (id: string) => {
        const response = await api.delete(`/api/v1/appointments/${id}`);
        return response.data;
    }
};
