import { useEffect, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';

interface UseWebSocketProps {
  room: string;
  roomType: 'shop' | 'customer';
  onEvent: (event: string, data: any) => void;
}

export const useWebSocket = ({ room, roomType, onEvent }: UseWebSocketProps) => {
  const socketRef = useRef<Socket>();

  const connect = useCallback(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const socketUrl = apiUrl.replace('/api', '');
    
    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    // Join appropriate room
    const joinEvent = roomType === 'shop' ? 'join_shop' : 'join_customer';
    socketRef.current.emit(joinEvent, room);

    // Listen to all relevant events
    const events = ['new_order', 'order_status_updated', 'bill_generated', 'payment_received'];
    events.forEach(event => {
      socketRef.current?.on(event, (data) => onEvent(event, data));
    });

    socketRef.current.on('connect', () => {
      console.log('WebSocket connected');
    });

    socketRef.current.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    return socketRef.current;
  }, [room, roomType, onEvent]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    if (room) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [room, connect, disconnect]);

  return {
    socket: socketRef.current,
    connect,
    disconnect,
    isConnected: socketRef.current?.connected || false
  };
};
