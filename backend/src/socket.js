import { Server } from 'socket.io';

let io;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*", // Or match your specific frontend URL if required
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected to Socket.IO', socket.id);

        socket.on('disconnect', () => {
            console.log('Client disconnected', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
