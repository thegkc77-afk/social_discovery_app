// discovery.ts - Discovery & Likes Service with API and Mock Fallback
import { User, DEFAULT_USERS } from '../data/mockData';
import api from './api';

export interface DiscoveryFilters {
  maxDistanceKm?: number;
  minAge?: number;
  maxAge?: number;
  gender?: string;
  intent?: string;
  interest?: string;
}

export interface LikeResult {
  success: boolean;
  liked: boolean;
  isMutualMatch: boolean;
  match?: any;
}

export const fetchNearbyUsers = async (filters: DiscoveryFilters = {}): Promise<User[]> => {
  console.log('[Discovery Service] Fetching nearby users with filters:', filters);

  const queryParams = new URLSearchParams();
  if (filters.maxDistanceKm) queryParams.append('maxDistanceKm', filters.maxDistanceKm.toString());
  if (filters.minAge) queryParams.append('minAge', filters.minAge.toString());
  if (filters.maxAge) queryParams.append('maxAge', filters.maxAge.toString());
  if (filters.gender) queryParams.append('gender', filters.gender);
  if (filters.intent) queryParams.append('intent', filters.intent);
  if (filters.interest) queryParams.append('interest', filters.interest);

  const queryString = queryParams.toString();
  const endpoint = `/discovery/nearby${queryString ? `?${queryString}` : ''}`;

  const res = await api.get<User[]>(endpoint);

  if (res.success && res.data && res.data.length > 0) {
    console.log(`[Discovery Service] Fetched ${res.data.length} users from API`);
    return res.data;
  }

  console.warn('[Discovery Service] API nearby fallback to mock dataset:', res.error);
  // Apply local in-memory filter to mock data if fallback
  let filtered = [...DEFAULT_USERS];
  if (filters.interest) {
    filtered = filtered.filter((u) => u.vibes.includes(filters.interest!));
  }
  return filtered;
};

export const likeUser = async (targetUserId: string): Promise<LikeResult> => {
  console.log('[Discovery Service] Liking user:', targetUserId);

  const res = await api.post<LikeResult>(`/discovery/${targetUserId}/like`);

  if (res.success && res.data) {
    return res.data;
  }

  console.warn('[Discovery Service] API like fallback:', res.error);
  return {
    success: true,
    liked: true,
    isMutualMatch: false,
  };
};

export const unlikeUser = async (targetUserId: string): Promise<boolean> => {
  console.log('[Discovery Service] Unliking user:', targetUserId);

  const res = await api.delete(`/discovery/${targetUserId}/like`);
  return res.success;
};

export const updateUserLocation = async (
  latitude: number,
  longitude: number,
  city?: string,
): Promise<boolean> => {
  console.log('[Discovery Service] Updating coordinates:', latitude, longitude);

  const res = await api.post('/locations', {
    latitude,
    longitude,
    city,
  });

  return res.success;
};
