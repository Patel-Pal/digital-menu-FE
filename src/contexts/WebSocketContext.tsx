import React, { createContext, useContext, ReactNode } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface WebSocketContextType {
  socket: any;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
  room: string;
  roomType: 'shop' | 'customer';
  onEvent: (event: string, data: any) => void;
}

export const WebSocketProvider = ({ children, room, roomType, onEvent }: WebSocketProviderProps) => {
  const { socket, isConnected, connect, disconnect } = useWebSocket({
    room,
    roomType,
    onEvent
  });

  return (
    <WebSocketContext.Provider value={{ socket, isConnected, connect, disconnect }}>
      {children}
    </WebSocketContext.Provider>
  );
};
