import api from '../lib/api';
import type { AuthResponse } from '../types';

export const authService = {
    login: async (credentials: Record<string, string>): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/api/v1/auth/login', credentials);
        return response.data;
    },
    logout: async () => {
        const response = await api.post('/api/v1/auth/logout');
        return response.data;
    }
};
