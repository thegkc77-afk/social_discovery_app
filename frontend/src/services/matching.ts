// matching.ts stub
import { User, DEFAULT_USERS } from '../data/mockData';

export interface MatchingCriteria {
  topic: string;
  maxDistanceKm: number;
}

export const joinMatchingPool = async (userId: string, criteria: MatchingCriteria): Promise<boolean> => {
  console.log('[Matching Service] User:', userId, 'joined matching pool for topic:', criteria.topic);
  await new Promise((resolve) => setTimeout(resolve, 500));
  return true;
};

export const leaveMatchingPool = async (userId: string): Promise<boolean> => {
  console.log('[Matching Service] User:', userId, 'left matching pool');
  await new Promise((resolve) => setTimeout(resolve, 300));
  return true;
};

export const findVibeMatch = async (userId: string, topic: string): Promise<User | null> => {
  console.log('[Matching Service] Searching match for user:', userId, 'topic:', topic);
  // Simulate active searching latency (3 seconds)
  await new Promise((resolve) => setTimeout(resolve, 3000));
  
  // Pick from default profiles that match or have similar vibes
  const potential = DEFAULT_USERS.filter(u => u.id !== userId);
  if (potential.length > 0) {
    const randomIndex = Math.floor(Math.random() * potential.length);
    return potential[randomIndex];
  }
  return null;
};
