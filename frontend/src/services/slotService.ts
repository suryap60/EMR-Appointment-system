import api from '../lib/api';

export const slotService = {
    getSlots: async (doctorId: string, date: string) => {
        const response = await api.get(`/api/v1/slots?doctorId=${doctorId}&date=${date}`);
        return response.data.data;
    }
};
