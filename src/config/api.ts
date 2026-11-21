import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const getApiBaseUrl = (): string => {
  // If running on Web browser
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        return 'http://localhost:5000/api';
      }
      return `http://${host}:5000/api`;
    }
    return 'http://localhost:5000/api';
  }

  // If environment variable explicitly configured
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes('192.168.1.10') && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }

  // Detect local IP from Expo Go hostUri (e.g., 10.109.67.143:8081 -> 10.109.67.143:5000)
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri && !hostUri.includes('exp.direct') && !hostUri.includes('ngrok')) {
    const pcIp = hostUri.split(':')[0];
    if (pcIp && /^\d+\.\d+\.\d+\.\d+$/.test(pcIp)) {
      return `http://${pcIp}:5000/api`;
    }
  }

  return 'http://localhost:5000/api';
};

export const getSocketBaseUrl = (): string => {
  const apiBase = getApiBaseUrl();
  return apiBase.replace(/\/api\/?$/, '');
};

export const API_BASE_URL = getApiBaseUrl();
