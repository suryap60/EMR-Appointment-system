import { io, Socket } from 'socket.io-client';

// Connect to the API URL or default localhost
const URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const socket: Socket = io(URL, {
    autoConnect: false, // Wait until explicit provider mounts
    withCredentials: true,
    transports: ['websocket']
});
