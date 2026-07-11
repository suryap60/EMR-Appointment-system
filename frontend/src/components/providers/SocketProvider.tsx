import React, { createContext, useEffect, useState } from 'react';
import { socket } from '../../lib/socket';
import type { Socket } from 'socket.io-client';

interface SocketContextState {
    socket: Socket | null;
    isConnected: boolean;
}

export const SocketContext = createContext<SocketContextState>({
    socket: null,
    isConnected: false,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        socket.connect();

        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
