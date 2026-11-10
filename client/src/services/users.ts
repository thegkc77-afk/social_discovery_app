import { API_BASE_URL } from '../config/api';
import { getAccessToken, getUserCache, saveUserCache } from '../utils/storage';
import { User, updateActiveUser } from '../data/mockData';

export const fetchUserProfile = async (_userId?: string): Promise<User | null> => {
  try {
    const token = await getAccessToken();
    if (token) {
      const res = await fetch(`${API_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        const u = data.data;
        const photos = Array.isArray(u.photos)
          ? u.photos.map((p: any) => (typeof p === 'string' ? p : p.photo_url || p.url))
          : [];
        const primaryAvatar =
          photos[0] || u.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80';

        const userObj: User = {
          id: u.id,
          name: u.name || 'Vibe User',
          age: u.dateOfBirth
            ? Math.floor((Date.now() - new Date(u.dateOfBirth).getTime()) / 31557600000)
            : 23,
          avatar: primaryAvatar,
          detailImage: photos[1] || primaryAvatar,
          distance: '0 km away',
          location: u.location?.name || 'Bangalore, India',
          online: true,
          vibes: u.interests && u.interests.length > 0 ? u.interests : ['Gaming', 'Music'],
          bio: u.bio || '',
          likes: 0,
          commentsCount: 0,
          hasLiked: false,
          messages: [],
          verificationStatus: u.isVerified ? 'verified' : 'not_started',
          intent: (u.intents && u.intents[0]) || 'Dating',
          connectionIntents: u.intents && u.intents.length > 0 ? u.intents : ['Dating'],
          isAvailable: true,
          phoneVerified: Boolean(u.phone),
          profileVerified: Boolean(u.isVerified),
          profilePhotos: photos,
          talkNowAvailable: photos.length >= 2,
        };

        await saveUserCache(userObj);
        updateActiveUser(userObj as any);
        return userObj;
      }
    }
  } catch (err) {
    console.warn('[UsersService] Error fetching profile:', err);
  }

  const cached = await getUserCache();
  return cached || null;
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
  try {
    const token = await getAccessToken();
    if (token) {
      const res = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const cached = (await getUserCache()) || {};
        const merged = { ...cached, ...data.data };
        await saveUserCache(merged);
        updateActiveUser(merged);
        return true;
      }
    }
  } catch (e) {
    console.warn('[UsersService] updateBasicProfile network error:', e);
  }

  return true;
};

export const saveUserPhotos = async (photoUrls: string[]): Promise<boolean> => {
  try {
    const token = await getAccessToken();
    if (token) {
      const res = await fetch(`${API_BASE_URL}/profile/photos`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ photos: photoUrls }),
      });
      const data = await res.json();
      if (data.success) {
        const cached = (await getUserCache()) || {};
        const primaryAvatar = photoUrls[0] || cached.avatar;
        const merged = {
          ...cached,
          avatar: primaryAvatar,
          profilePhotos: photoUrls,
          talkNowAvailable: photoUrls.length >= 2,
        };
        await saveUserCache(merged);
        updateActiveUser(merged);
        return true;
      }
    }
  } catch (err) {
    console.warn('[UsersService] saveUserPhotos network error:', err);
  }

  return true;
};

export const saveUserInterests = async (interests: string[]): Promise<boolean> => {
  try {
    const token = await getAccessToken();
    if (token) {
      const res = await fetch(`${API_BASE_URL}/profile/interests`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ interests }),
      });
      const data = await res.json();
      if (data.success) {
        const cached = (await getUserCache()) || {};
        const merged = { ...cached, vibes: interests, interests };
        await saveUserCache(merged);
        updateActiveUser(merged);
        return true;
      }
    }
  } catch (err) {
    console.warn('[UsersService] saveUserInterests network error:', err);
  }

  return true;
};

export const saveUserIntents = async (intents: string[]): Promise<boolean> => {
  try {
    const token = await getAccessToken();
    if (token) {
      const res = await fetch(`${API_BASE_URL}/profile/intent`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ intents }),
      });
      const data = await res.json();
      if (data.success) {
        const cached = (await getUserCache()) || {};
        const merged = {
          ...cached,
          connectionIntents: intents,
          intent: intents[0] || 'Dating',
        };
        await saveUserCache(merged);
        updateActiveUser(merged);
        return true;
      }
    }
  } catch (err) {
    console.warn('[UsersService] saveUserIntents network error:', err);
  }

  return true;
};

export const saveUserLocation = async (
  locationName: string,
  latitude?: number,
  longitude?: number
): Promise<boolean> => {
  try {
    const token = await getAccessToken();
    if (token) {
      const res = await fetch(`${API_BASE_URL}/profile/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ locationName, latitude, longitude }),
      });
      const data = await res.json();
      if (data.success) {
        const cached = (await getUserCache()) || {};
        const merged = { ...cached, location: locationName };
        await saveUserCache(merged);
        updateActiveUser(merged);
        return true;
      }
    }
  } catch (err) {
    console.warn('[UsersService] saveUserLocation network error:', err);
  }

  return true;
};

export const completeProfileOnboarding = async (): Promise<boolean> => {
  try {
    const token = await getAccessToken();
    if (token) {
      await fetch(`${API_BASE_URL}/profile/verify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch (err) {
    console.warn('[UsersService] completeProfileOnboarding network error:', err);
  }
  return true;
};

export const fetchProfileCompletion = async () => {
  try {
    const token = await getAccessToken();
    if (token) {
      const res = await fetch(`${API_BASE_URL}/profile/completion`, {
        headers: { Authorization: `Bearer ${token}` },
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
    { id: 'gym_fitness', name: 'Gym & Fitness' },
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
    { id: 'just_talking', name: 'Just Talking' },
  ];
};
