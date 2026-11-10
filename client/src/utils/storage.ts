import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEYS = {
  ACCESS_TOKEN: 'vibematch_access_token',
  REFRESH_TOKEN: 'vibematch_refresh_token',
  USER: 'vibematch_user_profile',
};

const isWeb = Platform.OS === 'web';

export const setSecureItem = async (key: string, value: string): Promise<void> => {
  if (isWeb) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

export const getSecureItem = async (key: string): Promise<string | null> => {
  if (isWeb) {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  }
  return await SecureStore.getItemAsync(key);
};

export const removeSecureItem = async (key: string): Promise<void> => {
  if (isWeb) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

export const saveAuthTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
  await setSecureItem(KEYS.ACCESS_TOKEN, accessToken);
  await setSecureItem(KEYS.REFRESH_TOKEN, refreshToken);
};

export const getAccessToken = async (): Promise<string | null> => {
  return await getSecureItem(KEYS.ACCESS_TOKEN);
};

export const getRefreshToken = async (): Promise<string | null> => {
  return await getSecureItem(KEYS.REFRESH_TOKEN);
};

export const saveUserCache = async (user: any): Promise<void> => {
  await setSecureItem(KEYS.USER, JSON.stringify(user));
};

export const getUserCache = async (): Promise<any | null> => {
  const json = await getSecureItem(KEYS.USER);
  return json ? JSON.parse(json) : null;
};

export const clearAuthStorage = async (): Promise<void> => {
  await removeSecureItem(KEYS.ACCESS_TOKEN);
  await removeSecureItem(KEYS.REFRESH_TOKEN);
  await removeSecureItem(KEYS.USER);
};

export const clearAuthData = clearAuthStorage;

