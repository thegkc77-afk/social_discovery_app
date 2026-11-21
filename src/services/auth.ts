import { API_BASE_URL } from '../config/api';
import { saveAuthTokens, saveUserCache, getAccessToken, getUserCache, clearAuthStorage } from '../utils/storage';

export interface AuthUser {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  isVerified?: boolean;
  accountStatus?: string;
}

export const sendOTP = async (phone: string, dialCode = '+91') => {
  console.log(`[AuthService] Sending OTP to ${dialCode}${phone}`);
  return { success: true, message: 'OTP sent successfully' };
};

export const verifyOTP = async (phone: string, otp: string) => {
  console.log(`[AuthService] Verifying OTP ${otp} for ${phone}`);
  return { success: true, token: 'mock-otp-token' };
};

/**
 * Sign up user via backend /api/auth/signup
 */
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
    } else if (!data.success) {
      throw new Error(data.message || 'Registration failed');
    }
  } catch (error: any) {
    console.warn('[AuthService] Signup API error:', error?.message || error);
    throw error;
  }
};

/**
 * Login user via backend /api/auth/login
 */
export const loginUser = async (
  email?: string | null,
  password: string = 'SecurePassword123',
  phone?: string | null
) => {
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
    if (data.success && data.token) {
      await saveAuthTokens(data.token, data.token);
      await saveUserCache(data.user);
      return data;
    } else if (!data.success) {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error: any) {
    console.warn('[AuthService] Login API error:', error?.message || error);
    throw error;
  }
};

/**
 * Fetch current user from backend /api/auth/me
 */
export const fetchCurrentUser = async (): Promise<AuthUser | null> => {
  const token = await getAccessToken();
  if (!token) return null;

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

/**
 * Logout user session
 */
export const logoutUser = async () => {
  try {
    await clearAuthStorage();
  } catch (e) {
    console.warn('[AuthService] Logout storage clear failed:', e);
  }
};

/**
 * Ensures the app has an authenticated backend session token.
 */
export const ensureAuthenticated = async (): Promise<{ token: string; user: AuthUser }> => {
  const existingToken = await getAccessToken();
  const existingUser = await getUserCache();

  if (existingToken && existingUser) {
    return { token: existingToken, user: existingUser };
  }

  const randomSuffix = Math.floor(Math.random() * 10000);
  const name = `VibeUser_${randomSuffix}`;
  const email = `user_${Date.now()}_${randomSuffix}@vibematch.local`;

  try {
    const authData = await registerUser(name, email, 'SecurePassword123', '2000-01-01');
    return { token: authData.token, user: authData.user };
  } catch {
    const authData = await loginUser(email, 'SecurePassword123');
    return { token: authData.token, user: authData.user };
  }
};
