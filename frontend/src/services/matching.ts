// matching.ts - Matching Service with Backend Integration and Fallback
import { User, DEFAULT_USERS } from '../data/mockData';
import api from './api';

export interface MatchingCriteria {
  topic: string;
  maxDistanceKm?: number;
  socketId?: string;
}

export interface MatchResponse {
  status: 'searching' | 'matched';
  requestId?: string;
  matchId?: string;
  partner?: User;
  score?: number;
  message?: string;
}

export const joinMatchingPool = async (
  userId: string,
  criteria: MatchingCriteria,
): Promise<MatchResponse> => {
  console.log('[Matching Service] Joining matching pool for topic:', criteria.topic);

  const res = await api.post<MatchResponse>('/matching/talk-now', {
    topic: criteria.topic,
    maxDistanceKm: criteria.maxDistanceKm || 50,
    socketId: criteria.socketId,
  });

  if (res.success && res.data) {
    return res.data;
  }

  console.warn('[Matching Service] API matching pool fallback:', res.error);
  return {
    status: 'searching',
    requestId: 'mock_request_id',
  };
};

export const leaveMatchingPool = async (userId: string): Promise<boolean> => {
  console.log('[Matching Service] Leaving matching pool for:', userId);
  const res = await api.post('/matching/cancel');
  return res.success;
};

export const findVibeMatch = async (userId: string, topic: string): Promise<User | null> => {
  console.log('[Matching Service] Searching match for topic:', topic);

  const res = await api.post<MatchResponse>('/matching/talk-now', {
    topic,
    maxDistanceKm: 50,
  });

  if (res.success && res.data && res.data.status === 'matched' && res.data.partner) {
    console.log('[Matching Service] Match found via backend:', res.data.partner.name);
    return res.data.partner;
  }

  // Fallback simulation (3 seconds) for offline / demo mode
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const potential = DEFAULT_USERS.filter((u) => u.id !== userId);
  if (potential.length > 0) {
    const randomIndex = Math.floor(Math.random() * potential.length);
    return potential[randomIndex];
  }
  return null;
};
