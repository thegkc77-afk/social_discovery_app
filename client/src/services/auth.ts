import { API_BASE_URL } from '../config/api';
import { saveAuthTokens, saveUserCache, getAccessToken, getUserCache, clearAuthStorage } from '../utils/storage';
import { supabase, isSupabaseConfigured } from './supabase';

export interface AuthUser {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string;
  bio?: string;
  avatar?: string;
  photos?: string[];
  interests?: string[];
  intents?: string[];
  isVerified?: boolean;
  phoneVerified?: boolean;
  twoFactorEnabled?: boolean;
  accountStatus?: string;
  location?: {
    name: string;
    latitude?: number;
    longitude?: number;
  } | null;
}

export interface LoginResult {
  success: boolean;
  twoFactorRequired?: boolean;
  tempToken?: string;
  phoneMasked?: string;
  smsDelivered?: boolean;
  token?: string;
  user?: AuthUser;
  message?: string;
}

export const sendOTP = async (phone: string, dialCode = '+91') => {
  const fullPhone = phone.startsWith('+') ? phone : `${dialCode}${phone}`;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: fullPhone }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to send OTP');
    }
    return data;
  } catch (error: any) {
    console.warn('[AuthService] sendOTP error:', error?.message || error);
    throw error;
  }
};

export const verifyOTP = async (phone: string, otp: string) => {
  try {
    const existingToken = await getAccessToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (existingToken) {
      headers.Authorization = `Bearer ${existingToken}`;
    }

    const res = await fetch(`${API_BASE_URL}/auth/otp/verify`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ phone, otp }),
    });
    const data = await res.json();
    if (data.success && data.token) {
      await saveAuthTokens(data.token, data.token);
      await saveUserCache(data.user);
      return data;
    }
    throw new Error(data.message || 'OTP verification failed');
  } catch (error: any) {
    console.warn('[AuthService] verifyOTP error:', error?.message || error);
    throw error;
  }
};

export const sendSupabasePhoneOtp = async (phone: string, dialCode = '+91') => {
  const fullPhone = phone.startsWith('+') ? phone : `${dialCode}${phone}`;
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: fullPhone,
    });
    if (error) {
      console.warn('[SupabaseAuth] signInWithOtp phone error:', error.message);
    } else {
      return { success: true, data };
    }
  }
  return await sendOTP(fullPhone);
};

export const verifySupabasePhoneOtp = async (phone: string, token: string) => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    if (!error && data?.session) {
      console.log('[SupabaseAuth] Session verified successfully');
    }
  }
  return await verifyOTP(phone, token);
};

export const sendSupabaseEmailOtp = async (email: string) => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
    });
    if (error) throw error;
    return data;
  }
  throw new Error('Supabase is not configured');
};

export const verifySupabaseEmailOtp = async (email: string, token: string) => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: 'email',
    });
    if (error) throw error;
    return data;
  }
  throw new Error('Supabase is not configured');
};

export const registerUser = async (
  name: string,
  email?: string | null,
  password: string = 'SecurePassword123',
  dateOfBirth: string = '2000-01-01',
  phone?: string | null
) => {
  const finalName = name || 'Vibe User';
  const finalEmail = email ? email.trim().toLowerCase() : undefined;
  const finalPhone = phone ? phone.trim() : undefined;
  const finalDob = dateOfBirth || '2000-01-01';

  try {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: finalName,
        email: finalEmail,
        phone: finalPhone,
        password,
        dateOfBirth: finalDob,
      }),
    });
    const data = await res.json();
    if (data.success && data.token) {
      await saveAuthTokens(data.token, data.token);
      await saveUserCache(data.user);
      return data;
    }
    throw new Error(data.message || 'Registration failed');
  } catch (error: any) {
    console.warn('[AuthService] Signup API error:', error?.message || error);
    throw error;
  }
};

export const loginUser = async (
  email?: string | null,
  password: string = 'SecurePassword123',
  phone?: string | null
): Promise<LoginResult> => {
  const finalEmail = email ? email.trim().toLowerCase() : undefined;
  const finalPhone = phone ? phone.trim() : undefined;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: finalEmail,
        phone: finalPhone,
        password,
      }),
    });
    const data = await res.json();

    if (data.success && data.twoFactorRequired) {
      return {
        success: true,
        twoFactorRequired: true,
        tempToken: data.tempToken,
        phoneMasked: data.phoneMasked,
        smsDelivered: data.smsDelivered,
        message: data.message,
      };
    }

    if (data.success && data.token) {
      await saveAuthTokens(data.token, data.token);
      await saveUserCache(data.user);
      return data;
    }
    throw new Error(data.message || 'Login failed');
  } catch (error: any) {
    console.warn('[AuthService] Login API error:', error?.message || error);
    throw error;
  }
};

export const verifyTwoFactor = async (tempToken: string, otp: string): Promise<LoginResult> => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/2fa/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tempToken, otp }),
    });
    const data = await res.json();
    if (data.success && data.token) {
      await saveAuthTokens(data.token, data.token);
      await saveUserCache(data.user);
      return data;
    }
    throw new Error(data.message || 'Two-step verification failed');
  } catch (error: any) {
    console.warn('[AuthService] verifyTwoFactor error:', error?.message || error);
    throw error;
  }
};

export const enableTwoFactor = async (phone?: string): Promise<{ success: boolean; message: string }> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${API_BASE_URL}/auth/2fa/enable`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ phone }),
  });
  const data = await res.json();
  if (data.success && data.user) {
    await saveUserCache(data.user);
  }
  return data;
};

export const disableTwoFactor = async (): Promise<{ success: boolean; message: string }> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${API_BASE_URL}/auth/2fa/disable`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (data.success && data.user) {
    await saveUserCache(data.user);
  }
  return data;
};

export const getTwoFactorStatus = async (): Promise<{
  success: boolean;
  twoFactorEnabled: boolean;
  phone?: string | null;
  phoneMasked?: string | null;
}> => {
  const token = await getAccessToken();
  if (!token) return { success: false, twoFactorEnabled: false };

  try {
    const res = await fetch(`${API_BASE_URL}/auth/2fa/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch {
    return { success: false, twoFactorEnabled: false };
  }
};

export const fetchCurrentUser = async (): Promise<AuthUser | null> => {
  const token = await getAccessToken();
  if (!token || token === 'mock-otp-token') return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (data.success && data.user) {
      await saveUserCache(data.user);
      return data.user;
    }
  } catch (error: any) {
    console.warn('[AuthService] Fetch /me error:', error?.message || error);
  }

  const cached = await getUserCache();
  return cached || null;
};

export const logoutUser = async () => {
  try {
    await clearAuthStorage();
  } catch (e) {
    console.warn('[AuthService] Logout storage clear failed:', e);
  }
};

export const ensureAuthenticated = async (): Promise<{ token: string; user: AuthUser }> => {
  const existingToken = await getAccessToken();
  const existingUser = await getUserCache();

  if (existingToken && existingUser && existingToken !== 'mock-otp-token') {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${existingToken}`,
        },
      });
      const data = await res.json();
      if (data.success && data.user) {
        return { token: existingToken, user: data.user };
      }
    } catch {}
  }

  await clearAuthStorage();

  const randomSuffix = Math.floor(Math.random() * 10000);
  const name = `VibeUser_${randomSuffix}`;
  const email = `user_${Date.now()}_${randomSuffix}@vibematch.local`;

  try {
    const authData = await registerUser(name, email, 'SecurePassword123', '2000-01-01');
    return { token: authData.token, user: authData.user };
  } catch {
    const authData = await loginUser(email, 'SecurePassword123');
    return { token: authData.token!, user: authData.user! };
  }
};
