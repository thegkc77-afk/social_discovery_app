// users.ts - Users & Profile Service with API and Mock Fallback
import { User, ACTIVE_USER } from '../data/mockData';
import api from './api';

export interface OnboardingPayload {
  name: string;
  username?: string;
  birthdate: string;
  gender: string;
  bio?: string;
  photos: string[];
  interests: string[];
  intent: string;
  locationName?: string;
}

export const completeUserOnboarding = async (
  userId: string,
  payload: OnboardingPayload,
): Promise<boolean> => {
  console.log('[Users Service] Submitting onboarding for:', userId);

  const res = await api.post(
    userId === 'me' ? '/profiles/me/onboarding' : `/profiles/${userId}/onboarding`,
    payload,
  );

  if (res.success) {
    console.log('[Users Service] Onboarding profile saved to backend!');
    return true;
  }

  console.warn('[Users Service] API onboarding fallback:', res.error);
  return true;
};

export const fetchUserProfile = async (userId: string): Promise<User | null> => {
  console.log('[Users Service] Fetching user profile for:', userId);

  const endpoint = userId === 'me' ? '/auth/me' : `/users/${userId}`;
  const res = await api.get<any>(endpoint);

  if (res.success && res.data) {
    const raw = res.data;
    const profile = raw.profile || {};
    const photos = raw.photos || [];
    const interests = (raw.userInterests || []).map((ui: any) => ui.interest?.name || ui.name);

    return {
      id: raw.id,
      name: profile.name || 'Anonymous',
      age: profile.age || 24,
      avatar: profile.avatarUrl || photos[0]?.url || ACTIVE_USER.avatar,
      detailImage: profile.coverPhotoUrl || photos[0]?.url || ACTIVE_USER.avatar,
      distance: '0 km away',
      location: profile.locationName || 'Koramangala, Bangalore',
      online: profile.online ?? true,
      vibes: interests.length > 0 ? interests : ACTIVE_USER.interests,
      bio: profile.bio || '',
      likes: profile.likesCount || 0,
      commentsCount: profile.commentsCount || 0,
      hasLiked: false,
      messages: [],
      verificationStatus: (profile.verificationStatus || 'unverified').toLowerCase(),
      intent: profile.intent || 'Chatting & Fun',
      isAvailable: profile.isAvailable ?? true,
    };
  }

  // Fallback to local active user mock
  if (userId === 'me') {
    return {
      ...ACTIVE_USER,
      online: true,
      likes: 12,
      commentsCount: 3,
      hasLiked: false,
      messages: [],
      vibes: ACTIVE_USER.interests,
      distance: '0 km away',
    };
  }

  return null;
};

export const updateUserProfile = async (profileData: Partial<User>): Promise<boolean> => {
  console.log('[Users Service] Updating user profile with:', profileData);

  const res = await api.patch('/profiles/me', profileData);
  if (res.success) {
    return true;
  }

  await new Promise((resolve) => setTimeout(resolve, 500));
  return true;
};
