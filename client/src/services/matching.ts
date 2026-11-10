import { API_BASE_URL } from '../config/api';
import { getAccessToken } from '../utils/storage';
import { User } from '../data/mockData';

export interface MatchingCriteria {
  topic: string;
  maxDistanceKm: number;
}

export interface SwipeResponse {
  match: boolean;
  matchData?: {
    matchId: string;
    matchedUser: User;
  };
}

export const fetchDiscoveryFeed = async (limit = 20): Promise<User[]> => {
  try {
    const token = await getAccessToken();
    if (token) {
      const res = await fetch(`${API_BASE_URL}/users/discovery?limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        return data.data;
      }
    }
  } catch (err) {
    console.warn('[MatchingService] Error fetching discovery feed from backend:', err);
  }
  return [];
};

export const sendSwipe = async (toUserId: string, action: 'LIKE' | 'PASS' | 'SUPERLIKE'): Promise<SwipeResponse> => {
  return {
    match: action === 'LIKE' || action === 'SUPERLIKE',
    matchData: {
      matchId: `match-${toUserId}`,
      matchedUser: { id: toUserId } as any,
    },
  };
};

export const fetchUserMatches = async (): Promise<any[]> => {
  try {
    const token = await getAccessToken();
    if (token) {
      const res = await fetch(`${API_BASE_URL}/matches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        return data.data;
      }
    }
  } catch (e) {
    console.warn('[MatchingService] fetchUserMatches error:', e);
  }
  return [];
};

export const fetchReceivedLikes = async (): Promise<any[]> => {
  return [];
};

export const joinMatchingPool = async (_userId: string, _criteria: MatchingCriteria): Promise<boolean> => {
  return true;
};

export const leaveMatchingPool = async (_userId: string): Promise<boolean> => {
  return true;
};

export const findVibeMatch = async (_userId: string, topic: string): Promise<User | null> => {
  try {
    const token = await getAccessToken();
    if (token) {
      const res = await fetch(`${API_BASE_URL}/talk-now/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ topic: topic || 'General' }),
      });
      const data = await res.json();
      if (data.success && data.matched && data.match) {
        const feed = await fetchDiscoveryFeed();
        const candidate = feed.find((u) => u.id === data.match.userId);
        if (candidate) return candidate;

        return {
          id: data.match.userId,
          name: 'VibeMatch Partner',
          age: 23,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
          distance: '0.8 km away',
          location: 'Bangalore, India',
          online: true,
          vibes: [topic],
          bio: `Matched on ${topic}! 🎮`,
          likes: 10,
          commentsCount: 2,
          hasLiked: false,
          verificationStatus: 'verified',
          verified: true,
          messages: [],
        };
      }
    }
  } catch (err) {
    console.warn('[MatchingService] findVibeMatch backend error:', err);
  }
  return null;
};
