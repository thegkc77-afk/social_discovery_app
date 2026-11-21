import { API_BASE_URL } from '../config/api';
import { getAccessToken } from '../utils/storage';
import { User, DEFAULT_USERS } from '../data/mockData';

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
      const res = await fetch(`${API_BASE_URL}/users/discovery`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        return data.data;
      }
    }
  } catch (err) {
    console.warn('[MatchingService] Error fetching discovery feed from backend:', err);
  }
  return DEFAULT_USERS;
};

export const sendSwipe = async (toUserId: string, action: 'LIKE' | 'PASS' | 'SUPERLIKE'): Promise<SwipeResponse> => {
  const matchedUser = DEFAULT_USERS.find((u) => u.id === toUserId);
  return {
    match: action === 'LIKE' || action === 'SUPERLIKE',
    matchData: matchedUser ? {
      matchId: `match-${toUserId}`,
      matchedUser,
    } : undefined,
  };
};

export const fetchUserMatches = async (): Promise<any[]> => {
  return DEFAULT_USERS.map((user) => ({
    id: `match-${user.id}`,
    matchedUser: user,
  }));
};

export const fetchReceivedLikes = async (): Promise<any[]> => {
  return DEFAULT_USERS;
};

export const joinMatchingPool = async (userId: string, criteria: MatchingCriteria): Promise<boolean> => {
  return true;
};

export const leaveMatchingPool = async (userId: string): Promise<boolean> => {
  return true;
};

export const findVibeMatch = async (userId: string, topic: string): Promise<User | null> => {
  const girls = DEFAULT_USERS.filter((u) => u.id !== userId && ['tanya', 'tannu', 'sanya', 'ananya'].includes(u.id));
  const candidates = girls.length > 0 ? girls : DEFAULT_USERS.filter((u) => u.id !== userId);
  if (candidates.length > 0) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  return null;
};
