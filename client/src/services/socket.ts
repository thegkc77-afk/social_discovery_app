import { io, Socket } from 'socket.io-client';
import { getAccessToken, clearAuthStorage } from '../utils/storage';
import { getSocketBaseUrl } from '../config/api';

let socketInstance: Socket | null = null;

export const connectSocket = async (): Promise<Socket | null> => {
  try {
    const token = await getAccessToken();
    if (!token || token === 'mock-otp-token') {
      return null;
    }

    if (socketInstance) {
      if (socketInstance.connected) {
        return socketInstance;
      }
      socketInstance.connect();
      return socketInstance;
    }

    const socketUrl = getSocketBaseUrl();

    socketInstance = io(socketUrl, {
      auth: { token },
      transports: ['polling', 'websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      timeout: 10000,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected to server successfully:', socketInstance?.id);
    });

    socketInstance.on('connect_error', async (err) => {
      console.warn('[Socket] Connection status:', err.message);
      if (
        err.message.includes('token') ||
        err.message.includes('Invalid') ||
        err.message.includes('Authentication')
      ) {
        await clearAuthStorage();
        if (socketInstance) {
          socketInstance.disconnect();
          socketInstance = null;
        }
      }
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
