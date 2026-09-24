import { API_BASE_URL } from '../config/api';
import { getAccessToken } from '../utils/storage';
import { User, ACTIVE_USER, updateActiveUser } from '../data/mockData';

export const fetchUserProfile = async (userId?: string): Promise<User | null> => {
  try {
    const token = await getAccessToken();
    if (token) {
      const res = await fetch(`${API_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        const u = data.data;
        const photos = Array.isArray(u.photos) ? u.photos.map((p: any) => typeof p === 'string' ? p : (p.photo_url || p.url)) : [];

        return {
          id: u.id || ACTIVE_USER.id,
          name: u.name || ACTIVE_USER.name,
          age: u.dateOfBirth ? Math.floor((Date.now() - new Date(u.dateOfBirth).getTime()) / 31557600000) : 23,
          avatar: photos[0] || ACTIVE_USER.avatar,
          detailImage: photos[0] || ACTIVE_USER.avatar,
          distance: '0 km away',
          location: ACTIVE_USER.location,
          online: true,
          vibes: u.interests && u.interests.length > 0 ? u.interests : ACTIVE_USER.interests,
          bio: u.bio || ACTIVE_USER.bio,
          likes: 12,
          commentsCount: 3,
          hasLiked: false,
          messages: [],
          verificationStatus: ACTIVE_USER.verificationStatus,
          intent: (u.intents && u.intents[0]) || ACTIVE_USER.intent,
          connectionIntents: u.intents && u.intents.length > 0 ? u.intents : ACTIVE_USER.connectionIntents,
          isAvailable: true,
          phoneVerified: true,
          profileVerified: true,
          profilePhotos: photos.length > 0 ? photos : ACTIVE_USER.profilePhotos,
          talkNowAvailable: photos.length >= 2,
        };
      }
    }
  } catch (err) {
    console.warn('[UsersService] Error fetching profile:', err);
  }

  return {
    id: ACTIVE_USER.id,
    name: ACTIVE_USER.name,
    age: ACTIVE_USER.age,
    avatar: ACTIVE_USER.avatar,
    detailImage: ACTIVE_USER.avatar,
    distance: '0 km away',
    location: ACTIVE_USER.location,
    online: true,
    vibes: ACTIVE_USER.interests,
    bio: ACTIVE_USER.bio,
    likes: 12,
    commentsCount: 3,
    hasLiked: false,
    messages: [],
    verificationStatus: ACTIVE_USER.verificationStatus,
    intent: ACTIVE_USER.intent,
    connectionIntents: ACTIVE_USER.connectionIntents,
    isAvailable: ACTIVE_USER.isAvailable,
    phoneVerified: ACTIVE_USER.phoneVerified,
    profileVerified: ACTIVE_USER.profileVerified,
    profilePhotos: ACTIVE_USER.profilePhotos,
    talkNowAvailable: ACTIVE_USER.talkNowAvailable,
  };
};

export const updateBasicProfile = async (profileData: {
  name?: string;
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
  occupation?: string;
  education?: string;
  relationshipGoal?: string;
}): Promise<boolean> => {
  updateActiveUser({
    name: profileData.name || ACTIVE_USER.name,
    bio: profileData.bio || ACTIVE_USER.bio,
  });

  try {
    const token = await getAccessToken();
    if (token) {
      await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
    }
  } catch (e) {
    console.warn('[UsersService] updateBasicProfile network error:', e);
  }

  return true;
};

export const saveUserPhotos = async (photoUrls: string[]): Promise<boolean> => {
  const primaryAvatar = photoUrls[0] || ACTIVE_USER.avatar;
  updateActiveUser({
    avatar: primaryAvatar,
    profilePhotos: photoUrls,
  });
  try {
    const cached = (await getUserCache()) || {};
    await saveUserCache({
      ...cached,
      ...ACTIVE_USER,
      avatar: primaryAvatar,
      profilePhotos: photoUrls,
    });
  } catch (err) {
    console.warn('[UsersService] Error caching user photos:', err);
  }
  return true;
};

export const saveUserInterests = async (interests: string[]): Promise<boolean> => {
  updateActiveUser({
    interests,
  });

  try {
    const token = await getAccessToken();
    if (token) {
      const res = await fetch(`${API_BASE_URL}/profile/interests`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ interests })
      });
      const data = await res.json();
      if (!data.success) {
        console.warn('[UsersService] Save interests API response:', data.message);
      }
    }
  } catch (err) {
    console.warn('[UsersService] Save interests API network error:', err);
  }

  return true;
};

export const saveUserIntents = async (intents: string[]): Promise<boolean> => {
  updateActiveUser({
    connectionIntents: intents,
    intent: intents[0] || ACTIVE_USER.intent,
  });

  try {
    const token = await getAccessToken();
    if (token) {
      const res = await fetch(`${API_BASE_URL}/profile/intent`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ intents })
      });
      const data = await res.json();
      if (!data.success) {
        console.warn('[UsersService] Save intents API response:', data.message);
      }
    }
  } catch (err) {
    console.warn('[UsersService] Save intents API network error:', err);
  }

  return true;
};

export const getUserPreferences = async () => {
  try {
    const token = await getAccessToken();
    if (token) {
      const res = await fetch(`${API_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        return data.data;
      }
    }
  } catch (err) {
    console.warn('[UsersService] Error fetching preferences:', err);
  }
  return null;
};

export const saveUserLocation = async (locationName: string, latitude?: number, longitude?: number): Promise<boolean> => {
  updateActiveUser({
    location: locationName,
  });
  return true;
};

export const completeProfileOnboarding = async (): Promise<boolean> => {
  updateActiveUser({
    phoneVerified: true,
  });
  return true;
};

export const fetchProfileCompletion = async () => {
  try {
    const token = await getAccessToken();
    if (token) {
      const res = await fetch(`${API_BASE_URL}/profile/completion`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    }
  } catch (err) {
    console.warn('[UsersService] fetchProfileCompletion error:', err);
  }
  return { completed: true, photoCount: 2 };
};

export const fetchAvailableInterests = async (): Promise<{ id: string; name: string }[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/interests`);
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }
  } catch (e) {
    console.warn('[UsersService] fetchAvailableInterests network error:', e);
  }

  return [
    { id: 'gaming', name: 'Gaming' },
    { id: 'dancing', name: 'Dancing' },
    { id: 'music', name: 'Music' },
    { id: 'movies', name: 'Movies' },
    { id: 'photography', name: 'Photography' },
    { id: 'books', name: 'Books' },
    { id: 'traveling', name: 'Traveling' },
    { id: 'gym_fitness', name: 'Gym & Fitness' }
  ];
};

export const fetchAvailableIntents = async (): Promise<{ id: string; name: string }[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/intents`);
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }
  } catch (e) {
    console.warn('[UsersService] fetchAvailableIntents network error:', e);
  }

  return [
    { id: 'dating', name: 'Dating' },
    { id: 'friendship', name: 'Friendship' },
    { id: 'networking', name: 'Networking' },
    { id: 'just_talking', name: 'Just Talking' }
  ];
};
