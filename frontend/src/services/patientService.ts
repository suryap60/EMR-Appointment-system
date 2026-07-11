import api from '../lib/api';

export const patientService = {
    searchPatients: async (query: string) => {
        const response = await api.get(`/api/v1/patients/search?q=${query}`);
        return response.data.data;
    },
    getPatients: async (params?: any) => {
        const response = await api.get('/api/v1/patients', { params });
        return response.data;
    },
    getMyPatients: async (params?: any) => {
        const response = await api.get('/api/v1/patients/my-patients', { params });
        return response.data;
    }
};
