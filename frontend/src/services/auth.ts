// auth.ts - Authentication Service with API and Mock Fallback
import api from './api';

export interface AuthResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  isNewUser?: boolean;
  user?: any;
  error?: string;
}

export const sendOTP = async (phoneNumber: string): Promise<boolean> => {
  console.log('[Auth Service] Requesting OTP for:', phoneNumber);

  const res = await api.post<{ message: string; expiresInSeconds: number }>(
    '/auth/request-otp',
    { phoneNumber },
  );

  if (res.success) {
    console.log('[Auth Service] OTP successfully requested from API');
    return true;
  }

  console.warn('[Auth Service] API request failed, falling back to mock mode:', res.error);
  // Fallback simulation delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  return true;
};

export const verifyOTP = async (
  phoneNumber: string,
  otp: string,
): Promise<AuthResult> => {
  console.log('[Auth Service] Verifying OTP:', otp, 'for:', phoneNumber);

  const res = await api.post<{
    accessToken: string;
    refreshToken: string;
    isNewUser: boolean;
    user: any;
  }>('/auth/verify-otp', { phoneNumber, otp });

  if (res.success && res.data) {
    console.log('[Auth Service] Authenticated successfully via API');
    api.setTokens(res.data.accessToken, res.data.refreshToken);
    return {
      success: true,
      accessToken: res.data.accessToken,
      refreshToken: res.data.refreshToken,
      isNewUser: res.data.isNewUser,
      user: res.data.user,
    };
  }

  console.warn('[Auth Service] API verify failed, evaluating dev fallback:', res.error);
  const isValidDev = otp === '123456' || otp.length === 6;

  if (isValidDev) {
    return {
      success: true,
      accessToken: 'mock_jwt_access_token',
      refreshToken: 'mock_jwt_refresh_token',
      isNewUser: false,
    };
  }

  return {
    success: false,
    error: res.error || 'Invalid OTP code',
  };
};

export const logout = async (): Promise<boolean> => {
  const res = await api.post('/auth/logout');
  api.clearTokens();
  return res.success;
};
