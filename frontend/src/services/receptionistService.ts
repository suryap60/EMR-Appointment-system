import api from '../lib/api';
import type { User } from '../types';

export interface ReceptionistPayload {
    name: string;
    email: string;
    password?: string;
}

export const receptionistService = {
    getReceptionists: async () => {
        const response = await api.get('/api/v1/receptionists');
        return response.data.data as User[];
    },

    createReceptionist: async (payload: ReceptionistPayload) => {
        const response = await api.post('/api/v1/receptionists', payload);
        return response.data.data as User;
    }
};
