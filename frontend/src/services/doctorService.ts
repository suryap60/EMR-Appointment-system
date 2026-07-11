import api from '../lib/api';
import type { Doctor } from '../types';

export const doctorService = {
    getAllDoctors: async (): Promise<Doctor[]> => {
        const response = await api.get('/api/v1/doctors');
        return response.data.data;
    },

    createDoctor: async (doctorData: Omit<Doctor, '_id'>): Promise<Doctor> => {
        const response = await api.post('/api/v1/doctors', doctorData);
        // Backend returns `{ user, doctor }`. Map it so Redux handles the nested populate cleanly
        const { user, doctor } = response.data.data;
        doctor.user = user;
        return doctor;
    },

    updateDoctorSchedule: async (id: string, scheduleData: any): Promise<Doctor> => {
        const response = await api.put(`/api/v1/doctors/${id}/schedule`, scheduleData);
        return response.data.data;
    }
};
