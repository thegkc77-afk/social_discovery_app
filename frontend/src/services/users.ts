// users.ts stub
import { User, ACTIVE_USER } from '../data/mockData';

export const fetchUserProfile = async (userId: string): Promise<User | null> => {
  console.log('[Users Service] Fetching user profile for:', userId);
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (userId === 'me') {
    // Map Active User credentials to User interface format
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
  await new Promise((resolve) => setTimeout(resolve, 800));
  return true;
};
