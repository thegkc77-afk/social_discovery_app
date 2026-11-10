import { io, Socket } from 'socket.io-client';
import { getAccessToken } from '../utils/storage';
import { getSocketBaseUrl } from '../config/api';

const SOCKET_URL = getSocketBaseUrl();

let socketInstance: Socket | null = null;

export const connectSocket = async (): Promise<Socket | null> => {
  try {
    const token = await getAccessToken();
    if (!token) {
      console.warn('[Socket] Cannot connect without JWT token');
      return null;
    }

    if (socketInstance && socketInstance.connected) {
      return socketInstance;
    }

    socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected to server successfully:', socketInstance?.id);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    return socketInstance;
  } catch (error) {
    console.error('[Socket] Error in connectSocket:', error);
    return null;
  }
};

export const getSocket = (): Socket | null => {
  return socketInstance;
};

export const disconnectSocket = (): void => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
